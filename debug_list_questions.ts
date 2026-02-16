
import mongoose from "mongoose";
import { IkigaiQuestion } from "./src/models/IkigaiQuestion";
import { MONGO_URI } from "./src/utils/secrets";

console.log("Connecting to:", MONGO_URI);

async function run() {
    await mongoose.connect(MONGO_URI);
    const questions = await IkigaiQuestion.find({});
    console.log("Questions found:", questions.length);
    console.log(JSON.stringify(questions, null, 2));
    await mongoose.disconnect();
}

run().catch(console.error);
