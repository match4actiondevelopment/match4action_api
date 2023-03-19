import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { Goal } from "../models/Goals";
import { createError } from "../utils/createError";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const goals = await Goal.find();

    return res.status(200).json({
      success: true,
      data: goals,
      message: "Goals list found.",
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const goal = await Goal.findOne({
      name: req?.body?.name,
    });

    if (goal) {
      return next(
        createError(404, "Sustainable Development Goal already created.")
      );
    }

    const { _id } = await Goal.create(req.body);

    const createdGoal = await Goal.findById(_id);

    if (!createdGoal) {
      return next(
        createError(404, "Sustainable Development Goal not created.")
      );
    }

    return res.status(201).json({
      success: true,
      data: createdGoal,
      message: "Goal created successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      throw new Error("Sustainable Development Goal not found.");
    }

    const objectId = new mongoose.Types.ObjectId(req.params.id);
    const deletedGoal = await Goal.findOneAndDelete(objectId);

    return res.status(200).json({
      success: !!deletedGoal,
      message: "Goal removed!",
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return next(createError(404, "Sustainable Development Goal not found."));
    }

    const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      upsert: true,
      returnOriginal: false,
    });

    if (!updatedGoal) {
      return next(
        createError(404, "Sustainable Development Goal not updated.")
      );
    }

    return res.status(200).json({
      success: true,
      data: updatedGoal,
      message: "Goal updated!",
    });
  } catch (error) {
    next(error);
  }
};
