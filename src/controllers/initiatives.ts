import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { Initiative } from "../models/Initiatives";
import { createError } from "../utils/createError";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const initiatives = await Initiative.find();

    return res.status(200).send({
      data: initiatives,
      success: true,
      message: "Initiatives list successfully found.",
    });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const initiative = await Initiative.findById(req?.params?.id)
      .populate("goals", "name image")
      .populate("userId", "name");

    if (!initiative) {
      return next(createError(404, "Initiative not found."));
    }

    return res.status(200).send({
      data: initiative,
      success: true,
      message: "Initiative successfully found.",
    });
  } catch (error) {
    next(error);
  }
};

export const getInitiativesByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = new mongoose.Types.ObjectId(req?.user?._id);

    const initiatives = await Initiative.find({
      userId,
    })
      .populate("goals", "name image")
      .populate("userId", "name");

    if (!initiatives) {
      return next(createError(404, "User initiatives not found."));
    }

    return res.status(200).send({
      data: initiatives,
      success: true,
      message: "User initiatives successfully found.",
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
    const endTime = new Date();
    const [endTimeHour, endTimeMinutes] = req?.body?.endTime.split(":");
    endTime.setHours(endTimeHour);
    endTime.setMinutes(endTimeMinutes);

    const startTime = new Date();
    const [startTimeHour, startTimeMinutes] = req?.body?.startTime.split(":");
    startTime.setHours(startTimeHour);
    startTime.setMinutes(startTimeMinutes);

    let image = null;
    if (req?.file) {
      // image = await uploadController.create(req, res);
      // if (!image?.success) {
      //   throw new Error("Error: image not uploaded.");
      // }
    }

    const initiative = new Initiative({
      ...req.body,
      startTime,
      endTime,
      // image: image?.data ?? null,
      userId: req?.user?._id,
      whatMovesThisInitiative: JSON.parse(req.body.whatMovesThisInitiative),
      servicesNeeded: JSON.parse(req.body.servicesNeeded),
      whichAreasAreCoveredByThisInitiative: JSON.parse(
        req.body.whichAreasAreCoveredByThisInitiative
      ),
      goals: JSON.parse(req.body.goals),
      location: JSON.parse(req.body.location),
    });

    const { _id } = await initiative.save();

    const createdInitiative = await Initiative.findById(_id);

    if (!createdInitiative) {
      return next(createError(404, "Initiative not created."));
    }

    return res.status(201).send({
      data: createdInitiative,
      success: true,
      message: "Initiative successfully created.",
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
    const objectId = new mongoose.Types.ObjectId(req.params.id);

    const initiative = await Initiative.findById(objectId);

    if (!initiative) {
      return next(createError(404, "Initiative not found."));
    }

    if (req?.user?._id !== initiative?.userId?.toString()) {
      return next(createError(403, "You can delete only your initiatives."));
    }

    const deletedInitiative = await Initiative.findOneAndDelete(objectId);

    return res.status(200).json({
      success: !!deletedInitiative,
      message: "Initiative successfully removed",
    });
  } catch (error) {
    next(error);
  }
};

export const subscribe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = new mongoose.Types.ObjectId(req?.params?.id);

    const initiative = await Initiative.findById(id);

    if (!initiative) {
      return next(createError(404, "Initiative not found."));
    }

    const updateInitiative = new Initiative(initiative);

    updateInitiative.applicants = [
      req?.user?._id,
      ...updateInitiative.applicants,
    ];

    const updatedInitiative = await Initiative.findByIdAndUpdate(
      id,
      updateInitiative,
      {
        upsert: true,
        returnOriginal: false,
      }
    );

    if (!updatedInitiative) {
      return next(createError(404, "Initiative subscription not updated."));
    }

    return res.status(200).json({
      data: updatedInitiative,
      success: true,
      message: "Initiative subscription successfully updated",
    });
  } catch (error) {
    next(error);
  }
};
