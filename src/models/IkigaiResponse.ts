import { Schema, model, Document, Types } from "mongoose";

export interface IResponse extends Document {
  userId: Types.ObjectId; // Reference to the user
  answers: {
    questionId: Types.ObjectId; // reference to the question answered
    optionValue: number;        // score value selected
    category: "passion" | "mission" | "profession" | "vocation";
  }[];
  totalScores: {
    passion: number;
    mission: number;
    profession: number;
    vocation: number;
  };
  suggestedIkigai: "passion" | "mission" | "profession" | "vocation"; // highest scoring quadrant
  createdAt: Date;
}

const ResponseSchema = new Schema<IResponse>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: "IkigaiQuestion", required: true },
        optionValue: { type: Number, required: true },
        category: {
          type: String,
          enum: ["passion", "mission", "profession", "vocation"],
          required: true,
        },
      },
    ],
    totalScores: {
      passion: { type: Number, default: 0 },
      mission: { type: Number, default: 0 },
      profession: { type: Number, default: 0 },
      vocation: { type: Number, default: 0 },
    },
    suggestedIkigai: {
      type: String,
      enum: ["passion", "mission", "profession", "vocation"],
      required: true,
    },
  },
  { timestamps: true }
);

export const IkigaiResponse = model<IResponse>("IkigaiResponse", ResponseSchema);
