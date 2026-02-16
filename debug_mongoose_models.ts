import mongoose from "mongoose";
import { IkigaiQuestion } from "./src/models/IkigaiQuestion";
import { User } from "./src/models/User";

// Force Mongoose to generate collection names
console.log("IkigaiQuestion collection name:", IkigaiQuestion.collection.name);
console.log("User collection name:", User.collection.name);
