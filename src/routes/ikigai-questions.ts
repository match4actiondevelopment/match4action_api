import { Router } from "express";
import { IkigaiQuestion } from "../models/IkigaiQuestion";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const questions = await IkigaiQuestion.find();
    res.json(questions); // return all questions
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

export default router;
