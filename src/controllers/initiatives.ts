import { Request, Response } from "express";
import mongoose from "mongoose";
import { Initiative, InitiativeDocument } from "../models/Initiatives";
import { User } from "../models/User";
import { UploadController } from "./upload";

const uploadController = new UploadController();

export class InitiativesController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const initiatives = await Initiative.find();

      res.status(200).json({
        success: true,
        data: initiatives,
      });
    } catch (error) {
      res.status(404);
    }
  }

  async getOne(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) {
        throw new Error("Id is required.");
      }

      const initiative = await Initiative.findById(req.params.id)
        .populate("goals", "name image")
        .populate("userId", "name");

      res.status(200).json({
        success: true,
        data: initiative,
      });
    } catch (error) {
      res.status(404);
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const userLogged = req.user;
      const user = await User.findById(userLogged?._id);

      if (!user) {
        res.status(404).json({ success: false, message: "User not found." });
        return;
      }

      if (userLogged?._id?.toString() !== user?._id?.toString()) {
        res.status(401).json({
          success: false,
          message: "Unauthorized! Access Token invalid!",
        });
        return;
      }

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
        image = await uploadController.create(req, res);

        if (!image?.success) {
          throw new Error("Error: image not uploaded.");
        }
      }

      const initiative = new Initiative({
        ...req.body,
        startTime,
        endTime,
        image: image?.data ?? null,
        userId: req.body.id,
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
        throw new Error("Initiative not created.");
      }

      res.status(201).json({
        success: true,
        data: createdInitiative,
      });
    } catch (error) {
      res.status(404);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const initiative = await Initiative.findById(req.params.id);

      if (!initiative) {
        throw new Error("Initiative not found.");
      }

      const objectId = new mongoose.Types.ObjectId(req.params.id);
      const deletedInitiative = await Initiative.findOneAndDelete(objectId);

      res.status(201).json({
        success: !!deletedInitiative,
      });
    } catch (error) {
      res.status(404);
    }
  }

  async subscribe(
    req: Request,
    res: Response
  ): Promise<InitiativeDocument | any> {
    try {
      const userLogged = req.user;

      if (!userLogged) {
        return res
          .status(404)
          .json({ success: false, message: "User not found." });
      }

      const initiative = await Initiative.findById(req.params.id);

      if (!initiative) {
        return res
          .status(404)
          .json({ success: false, message: "Initiative not found." });
      }

      const updateInitiative = new Initiative(initiative);
      updateInitiative.applicants = [
        ...updateInitiative.applicants,
        req.user?._id,
      ];

      const newInitiative = await User.findByIdAndUpdate(
        req.params.id,
        updateInitiative,
        {
          upsert: true,
          returnOriginal: false,
        }
      );

      if (!newInitiative) {
        return res
          .status(404)
          .json({ success: false, message: "Initiative not updated." });
      }

      res.status(200).json({ success: true, data: newInitiative });
    } catch (error) {
      res.status(404);
    }
  }
}
