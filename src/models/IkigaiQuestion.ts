import { Schema, model, Document } from "mongoose";

export interface IQuestionOption {
  text: string; // option shown to the user
  value: number; // score value
  category: "passion" | "mission" | "profession" | "vocation"; // quadrant
}

export interface IQuestion extends Document {
  text: string; // actual question text
  options: IQuestionOption[];
}

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  options: [
    {
      text: { type: String, required: true },
      value: { type: Number, required: true },
      category: {
        type: String,
        enum: ["passion", "mission", "profession", "vocation"],
        required: true,
      },
    },
  ],
});

export const IkigaiQuestion = model<IQuestion>("IkigaiQuestion", QuestionSchema);
