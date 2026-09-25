import { randomUUID } from "crypto";
import { Notification } from "../models/Notification";
import { prepareEmail, sendEmail } from "./notificationEmail";

const MAX_ATTEMPTS = 3;
const RETRY_DELAY = 5 * 60 * 1000;
const SAFE_RETRY_WINDOW = 23 * 60 * 60 * 1000;

export async function dispatchNotification(
  applicationId: string
): Promise<string> {
  if (
    !["test", "live"].includes(
      process.env.EMAIL_MODE || ""
    )
  ) {
    return "pending";
  }

  const now = new Date();
  const token = randomUUID();

  const record = await Notification.findOneAndUpdate(
    {
      applicationId,
      $or: [
        {
          status: { $in: ["pending", "failed"] },
          nextAttemptAt: { $lte: now },
        },
        {
          status: "processing",
          lockedUntil: { $lte: now },
        },
      ],
    },
    {
      $set: {
        status: "processing",
        lockToken: token,
        lockedUntil: new Date(now.getTime() + 45000),
      },
    },
    { new: true }
  );

  if (!record) {
    return (
      (await Notification.findOne({ applicationId }))
        ?.status || "pending"
    );
  }

  const filter = {
    _id: record._id,
    lockToken: token,
  };

  try {
    if (
      record.attempts >= MAX_ATTEMPTS ||
      (record.firstAttemptAt &&
        now.getTime() -
          record.firstAttemptAt.getTime() >=
          SAFE_RETRY_WINDOW)
    ) {
      await Notification.updateOne(filter, {
        $set: {
          status: "needs_review",
          failureReason:
            "RETRY_LIMIT_OR_SAFE_WINDOW_EXCEEDED",
        },
        $push: {
          history: {
            at: now,
            status: "needs_review",
            reason:
              "RETRY_LIMIT_OR_SAFE_WINDOW_EXCEEDED",
          },
        },
        $unset: {
          lockToken: 1,
          lockedUntil: 1,
        },
      });

      return "needs_review";
    }

    // Freeze the payload after the first sending attempt.
    // Retries must reuse the same payload and idempotency key.
    if (record.payload) {
      if (
        record.mode !== process.env.EMAIL_MODE ||
        (record.mode === "live" &&
          process.env.VERCEL_ENV &&
          process.env.VERCEL_ENV !== "production")
      ) {
        throw new Error(
          "EMAIL_MODE_CHANGED_REQUIRES_REVIEW"
        );
      }

      if (!process.env.RESEND_API_KEY) {
        throw new Error(
          "EMAIL_PROVIDER_NOT_CONFIGURED"
        );
      }
    } else {
      const prepared = prepareEmail(record);
      record.set(prepared);
    }

    const attempt = await Notification.updateOne(
      filter,
      {
        $set: {
          payload: record.payload,
          mode: record.mode,
          intendedRecipients:
            record.intendedRecipients,
          firstAttemptAt:
            record.firstAttemptAt || now,
          lastAttemptAt: now,
        },
        $inc: {
          attempts: 1,
        },
      }
    );

    if (attempt.modifiedCount !== 1) {
      return "pending";
    }

    record.attempts += 1;

    const payload = record.payload!;

    const providerMessageId = await sendEmail(
      {
        from: payload.from,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
      },
      `application-${record.applicationId}`
    );

    const status =
      record.mode === "test" ? "test_sent" : "sent";

    await Notification.updateOne(filter, {
      $set: {
        status,
        sentAt: new Date(),
        providerMessageId,
        failureReason: null,
      },
      $push: {
        history: {
          at: new Date(),
          status,
        },
      },
      $unset: {
        lockToken: 1,
        lockedUntil: 1,
        nextAttemptAt: 1,
      },
    });

    return status;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "NOTIFICATION_ERROR";

    // Never store raw provider responses or credentials.
    const reason =
      /^[A-Z][A-Z0-9_]{1,100}$/.test(message)
        ? message
        : "NOTIFICATION_ERROR";

    const status =
      record.attempts >= MAX_ATTEMPTS
        ? "needs_review"
        : "failed";

    await Notification.updateOne(filter, {
      $set: {
        status,
        failureReason: reason,
        nextAttemptAt: new Date(
          Date.now() + RETRY_DELAY
        ),
      },
      $push: {
        history: {
          at: new Date(),
          status,
          reason,
        },
      },
      $unset: {
        lockToken: 1,
        lockedUntil: 1,
      },
    });

    return status;
  }
}