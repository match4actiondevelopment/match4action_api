import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SustainableDevelopmentGoal } from '../models/SustainableDevelopmentGoals';

export class SustainableDevelopmentGoalsController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const sustainableDevelopmentGoals = await SustainableDevelopmentGoal.find();

      res.status(200).json({
        success: true,
        data: sustainableDevelopmentGoals,
      });
    } catch (error) {
      res.status(404);
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const sustainableDevelopmentGoal = await SustainableDevelopmentGoal.findOne({
        name: req.body.name,
      });

      if (sustainableDevelopmentGoal) {
        throw new Error('Sustainable Development Goal already created.');
      }

      const { id } = await SustainableDevelopmentGoal.create(req.body);

      const createdSustainableDevelopmentGoal = await SustainableDevelopmentGoal.findById(id);

      if (!createdSustainableDevelopmentGoal) {
        throw new Error('Sustainable Development Goal not created.');
      }

      res.status(201).json({
        success: true,
        data: createdSustainableDevelopmentGoal,
      });
    } catch (error) {
      res.status(404);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const sustainableDevelopmentGoal = await SustainableDevelopmentGoal.findById(req.params.id);

      if (!sustainableDevelopmentGoal) {
        throw new Error('Sustainable Development Goal not found.');
      }

      const objectId = new mongoose.Types.ObjectId(req.params.id);
      const deletedSustainableDevelopmentGoal = await SustainableDevelopmentGoal.findOneAndDelete(objectId);

      res.status(201).json({
        success: !!deletedSustainableDevelopmentGoal,
      });
    } catch (error) {
      res.status(404);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const sustainableDevelopmentGoal = await SustainableDevelopmentGoal.findById(req.params.id);

      if (!sustainableDevelopmentGoal) {
        throw new Error('Sustainable Development Goal not found.');
      }

      const updatedSustainableDevelopmentGoal = await SustainableDevelopmentGoal.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          upsert: true,
          returnOriginal: false,
        }
      );

      if (!updatedSustainableDevelopmentGoal) {
        throw new Error('Sustainable Development Goal not updated.');
      }

      res.status(200).json({
        success: true,
        data: updatedSustainableDevelopmentGoal,
      });
    } catch (error) {
      res.status(404);
    }
  }
}
