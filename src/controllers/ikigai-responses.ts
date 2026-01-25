import { NextFunction, Request, Response } from "express";
import { IkigaiResponse } from "../models/IkigaiResponse";
import { createError } from "../utils/createError";

export const saveIkigaiResponse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return next(createError(401, "User not authenticated"));
    }

    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return next(createError(400, "Answers array is required"));
    }

    // Calculate total scores for each category
    const totalScores = {
      passion: 0,
      mission: 0,
      profession: 0,
      vocation: 0,
    };

    answers.forEach((answer: any) => {
      if (answer.category && totalScores.hasOwnProperty(answer.category)) {
        totalScores[answer.category as keyof typeof totalScores] += answer.optionValue || 0;
      }
    });

    // Determine the suggested Ikigai (highest scoring category)
    const suggestedIkigai = Object.keys(totalScores).reduce((a, b) =>
      totalScores[a as keyof typeof totalScores] > totalScores[b as keyof typeof totalScores] ? a : b
    ) as "passion" | "mission" | "profession" | "vocation";

    // Check if user already has a response and update it, or create a new one
    let ikigaiResponse = await IkigaiResponse.findOne({ userId });

    if (ikigaiResponse) {
      // Update existing response
      ikigaiResponse.answers = answers;
      ikigaiResponse.totalScores = totalScores;
      ikigaiResponse.suggestedIkigai = suggestedIkigai;
      await ikigaiResponse.save();
    } else {
      // Create new response
      ikigaiResponse = new IkigaiResponse({
        userId,
        answers,
        totalScores,
        suggestedIkigai,
      });
      await ikigaiResponse.save();
    }

    return res.status(201).send({
      data: ikigaiResponse,
      success: true,
      message: "Ikigai response saved successfully.",
    });

  } catch (error) {
    next(error);
  }
};

export const getIkigaiResponse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return next(createError(401, "User not authenticated"));
    }

    const ikigaiResponse = await IkigaiResponse.findOne({ userId })
      .sort({ createdAt: -1 })
      .populate('answers.questionId');

    if (!ikigaiResponse) {
      return res.status(200).send({
        data: null,
        success: true,
        message: "No Ikigai response found for this user.",
      });
    }

    return res.status(200).send({
      data: ikigaiResponse,
      success: true,
      message: "Ikigai response retrieved successfully.",
    });

  } catch (error) {
    next(error);
  }
};
