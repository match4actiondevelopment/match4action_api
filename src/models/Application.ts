import mongoose, { Schema } from "mongoose";

const applicationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    initiativeId: {
      type: Schema.Types.ObjectId,
      ref: "Initiative",
      required: true,
    },
    organisationId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roleName: {
      type: String,
      required: true,
    },
    organisationName: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: [
        "applied",
        "viewed",
        "shortlisted",
        "accepted",
        "declined",
        "withdrawn",
        "closed",
      ],
      default: "applied",
      required: true,
    },
    appliedAt: {
      type: Date,
      required: true,
    },
    consentTimestamp: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index(
  { userId: 1, initiativeId: 1 },
  { unique: true }
);

applicationSchema.index({ userId: 1, appliedAt: -1 });

export const Application = mongoose.model(
  "Application",
  applicationSchema
);