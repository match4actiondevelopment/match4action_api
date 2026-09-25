import mongoose, { Schema } from "mongoose";

const schema = new Schema(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
    },
    organisationId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    initiativeId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    volunteerName: {
      type: String,
      default: "",
    },
    volunteerEmail: {
      type: String,
      default: "",
    },
    roleName: {
      type: String,
      required: true,
    },
    appliedAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "sent",
        "test_sent",
        "failed",
        "needs_review",
      ],
      default: "pending",
      required: true,
    },
    mode: {
      type: String,
      enum: ["test", "live"],
    },
    intendedRecipients: {
      type: [String],
      default: [],
    },
    payload: {
      type: new Schema(
        {
          from: {
            type: String,
            required: true,
          },
          to: {
            type: [String],
            required: true,
          },
          subject: {
            type: String,
            required: true,
          },
          text: {
            type: String,
            required: true,
          },
        },
        { _id: false }
      ),
      default: undefined,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    firstAttemptAt: Date,
    lastAttemptAt: Date,
    nextAttemptAt: {
      type: Date,
      default: () => new Date(),
    },
    lockedUntil: Date,
    lockToken: String,
    sentAt: Date,
    providerMessageId: String,
    failureReason: {
      type: String,
      default: null,
    },
    history: [
      {
        _id: false,
        at: Date,
        status: String,
        reason: String,
      },
    ],
  },
  { timestamps: true }
);

schema.index({ status: 1, nextAttemptAt: 1 });

export const Notification = mongoose.model(
  "Notification",
  schema
);