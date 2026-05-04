import mongoose, { Document } from "mongoose";

const Schema = mongoose.Schema;

export interface AboutUsInfoDocument extends Document {
  contentHtml: string;
}

const aboutUsSchema = new Schema<AboutUsInfoDocument>(
  {
    contentHtml: {
      type: String,
      default: "<h1>About Us</h1><p>Welcome to Match4Action</p>",
    },
  },
  { timestamps: true }
);

export const AboutUsInfo = mongoose.model<AboutUsInfoDocument>("AboutUsInfo", aboutUsSchema);
