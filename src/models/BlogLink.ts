import mongoose, { Document } from "mongoose";

const Schema = mongoose.Schema;

export interface BlogLinkDocument extends Document {
  url: string;
}

const blogLinkSchema = new Schema<BlogLinkDocument>(
  {
    url: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const BlogLink = mongoose.model<BlogLinkDocument>("BlogLink", blogLinkSchema);
