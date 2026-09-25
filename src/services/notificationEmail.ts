import https from "https";
import { z } from "zod";

export type EmailPayload = {
  from: string;
  to: string[];
  subject: string;
  text: string;
};

const emails = z.array(z.string().email()).min(1).max(10);

export function prepareEmail(record: {
  organisationId: unknown;
  initiativeId: unknown;
  volunteerName: string;
  volunteerEmail: string;
  roleName: string;
  appliedAt: Date;
}) {
  const mode = process.env.EMAIL_MODE;

  if (mode !== "test" && mode !== "live") {
    throw new Error("EMAIL_DISABLED");
  }

  if (
    process.env.VERCEL_ENV &&
    process.env.VERCEL_ENV !== "production" &&
    mode === "live"
  ) {
    throw new Error("LIVE_EMAIL_BLOCKED_IN_PREVIEW");
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED");
  }

  const from = process.env.EMAIL_FROM?.trim() || "";

  if (!z.string().email().safeParse(from).success) {
    throw new Error("INVALID_SENDER");
  }

  let mapping: any;

  try {
    mapping = JSON.parse(
      process.env.ORG_NOTIFICATION_EMAILS || "{}"
    );
  } catch {
    throw new Error("INVALID_RECIPIENT_CONFIGURATION");
  }

  const recipients = emails.safeParse(
    mapping?.[String(record.organisationId)]
  );

  if (!recipients.success) {
    throw new Error(
      "MISSING_OR_INVALID_ORGANISATION_RECIPIENT"
    );
  }

  if (
    !record.volunteerName ||
    !z.string().email().safeParse(record.volunteerEmail).success
  ) {
    throw new Error("MISSING_VOLUNTEER_DETAILS");
  }

  const testRecipient =
    process.env.EMAIL_TEST_TO?.trim() || "";

  if (
    mode === "test" &&
    !z.string().email().safeParse(testRecipient).success
  ) {
    throw new Error("INVALID_TEST_RECIPIENT");
  }

  const base = new URL(
    process.env.NOTIFICATION_WEB_URL || ""
  );

  if (
    base.protocol !== "https:" ||
    base.username ||
    base.password
  ) {
    throw new Error("INVALID_PLATFORM_URL");
  }

  const link = new URL(
    `/initiatives/${record.initiativeId}`,
    base.origin
  ).href;

  const title = record.roleName
    .replace(/[\r\n]/g, " ")
    .slice(0, 150);

  const payload: EmailPayload = {
    from,
    to:
      mode === "test"
        ? [testRecipient]
        : Array.from(new Set(recipients.data)),
    subject: `${
      mode === "test" ? "[STAGING TEST] " : ""
    }New volunteer application for ${title}`,
    text: [
      mode === "test"
        ? "Test notification: the organisation has not been emailed."
        : "New volunteer application",
      `Volunteer: ${record.volunteerName}`,
      `Email: ${record.volunteerEmail}`,
      `Role: ${record.roleName}`,
      `Date applied (UTC): ${record.appliedAt.toISOString()}`,
      `View opportunity: ${link}`,
    ].join("\n\n"),
  };

  return {
    mode,
    intendedRecipients: recipients.data,
    payload,
  };
}

export function sendEmail(
  payload: EmailPayload,
  key: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);

    const request = https.request(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          "Idempotency-Key": key,
        },
      },
      (response) => {
        let result = "";

        response.setEncoding("utf8");

        response.on("data", (chunk) => {
          result += chunk;
        });

        response.on("error", () => {
          reject(new Error("EMAIL_NETWORK_ERROR"));
        });

        response.on("end", () => {
          if (
            !response.statusCode ||
            response.statusCode < 200 ||
            response.statusCode >= 300
          ) {
            return reject(
              new Error(
                `EMAIL_PROVIDER_HTTP_${response.statusCode || 0}`
              )
            );
          }

          try {
            const parsed = JSON.parse(result);

            if (
              typeof parsed.id !== "string" ||
              !parsed.id
            ) {
              throw new Error();
            }

            resolve(parsed.id);
          } catch {
            reject(
              new Error("INVALID_EMAIL_PROVIDER_RESPONSE")
            );
          }
        });
      }
    );

    const timer = setTimeout(() => {
      request.destroy(new Error("EMAIL_TIMEOUT"));
    }, 5000);

    request.on("close", () => {
      clearTimeout(timer);
    });

    request.on("error", (error) => {
      reject(
        new Error(
          error.message === "EMAIL_TIMEOUT"
            ? "EMAIL_TIMEOUT"
            : "EMAIL_NETWORK_ERROR"
        )
      );
    });

    request.end(body);
  });
}