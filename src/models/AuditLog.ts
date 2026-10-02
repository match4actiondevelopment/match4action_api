import mongoose, { Schema } from "mongoose";

const schema = new Schema({
  actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  actorRole: { type: String, required: true },
  event: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });
schema.index({ actorId: 1, createdAt: -1 });
export const AuditLog = mongoose.model("AuditLog", schema);