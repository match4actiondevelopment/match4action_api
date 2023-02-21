import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Goal } from '../models/Goals';

export class GoalsController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const goals = await Goal.find();

      res.status(200).json({
        success: true,
        data: goals,
      });
    } catch (error) {
      res.status(404);
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const goal = await Goal.findOne({
        name: req.body.name,
      });

      if (goal) {
        throw new Error('Sustainable Development Goal already created.');
      }

      const { id } = await Goal.create(req.body);

      const createdGoal = await Goal.findById(id);

      if (!createdGoal) {
        throw new Error('Sustainable Development Goal not created.');
      }

      res.status(201).json({
        success: true,
        data: createdGoal,
      });
    } catch (error) {
      res.status(404);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const goal = await Goal.findById(req.params.id);

      if (!goal) {
        throw new Error('Sustainable Development Goal not found.');
      }

      const objectId = new mongoose.Types.ObjectId(req.params.id);
      const deletedGoal = await Goal.findOneAndDelete(objectId);

      res.status(201).json({
        success: !!deletedGoal,
      });
    } catch (error) {
      res.status(404);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const goal = await Goal.findById(req.params.id);

      if (!goal) {
        throw new Error('Sustainable Development Goal not found.');
      }

      const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
        upsert: true,
        returnOriginal: false,
      });

      if (!updatedGoal) {
        throw new Error('Sustainable Development Goal not updated.');
      }

      res.status(200).json({
        success: true,
        data: updatedGoal,
      });
    } catch (error) {
      res.status(404);
    }
  }
}
