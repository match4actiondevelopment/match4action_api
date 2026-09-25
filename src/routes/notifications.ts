import { Router } from "express";
import mongoose from "mongoose";
import { isLogged } from "../middleware/jwt";
import { User } from "../models/User";
import { Notification } from "../models/Notification";
import { dispatchNotification } from "../services/notifications";
import { createError } from "../utils/createError";

const router = Router();

router.use(isLogged);

router.use(async (req, res, next) => {
  try {
    const allowed = (
      process.env.NOTIFICATION_ADMIN_IDS || ""
    )
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (!allowed.includes(String(req.user?._id))) {
      throw createError(
        403,
        "Platform admin access required."
      );
    }

    const user = await User.findById(
      req.user?._id
    ).select("role");

    if (!user || String(user.role) !== "admin") {
      throw createError(
        403,
        "Platform admin access required."
      );
    }

    res.setHeader(
      "Cache-Control",
      "private, no-store"
    );

    next();
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const filter: any = {};

    if (req.query.before) {
      if (
        typeof req.query.before !== "string" ||
        !/^[a-f\d]{24}$/i.test(req.query.before)
      ) {
        throw createError(
          400,
          "Invalid pagination cursor."
        );
      }

      filter._id = {
        $lt: new mongoose.Types.ObjectId(
          req.query.before
        ),
      };
    }

    if (req.query.status) {
      const statuses = [
        "pending",
        "processing",
        "sent",
        "test_sent",
        "failed",
        "needs_review",
      ];

      if (
        !statuses.includes(String(req.query.status))
      ) {
        throw createError(
          400,
          "Invalid notification status."
        );
      }

      filter.status = req.query.status;
    }

    const data = await Notification.find(filter)
      .sort({ _id: -1 })
      .limit(50)
      .select(
        "-payload -volunteerName -volunteerEmail -lockToken"
      )
      .lean();

    res.json({
      success: true,
      data,
      nextCursor:
        data.length === 50
          ? String(data[49]._id)
          : null,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/retry", async (req, res, next) => {
  try {
    const origin = req.get("origin");

    if (
      origin &&
      origin !==
        new URL(
          process.env.NOTIFICATION_WEB_URL || ""
        ).origin
    ) {
      throw createError(403, "Origin not allowed.");
    }

    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      throw createError(
        400,
        "Invalid notification ID."
      );
    }

    const record = await Notification.findById(
      req.params.id
    );

    if (!record) {
      throw createError(
        404,
        "Notification not found."
      );
    }

    if (
      ["sent", "test_sent", "needs_review"].includes(
        record.status
      )
    ) {
      throw createError(
        409,
        "This notification cannot be retried."
      );
    }

    const busy =
      record.status === "processing" &&
      record.lockedUntil &&
      record.lockedUntil > new Date();

    const notDue =
      record.status !== "processing" &&
      record.nextAttemptAt &&
      record.nextAttemptAt > new Date();

    if (busy || notDue) {
      throw createError(
        409,
        "Notification is busy or retry is not due yet."
      );
    }

    const status = await dispatchNotification(
      String(record.applicationId)
    );

    res.json({
      success: true,
      data: {
        notificationId: record._id,
        status,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;