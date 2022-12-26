import mongoose from 'mongoose';
import {
  CreateGoalParams,
  ICreateGoalRepository,
  IDeleteGoalRepository,
  IGetGoalsRepository,
  IUpdateGoalRepository,
  UpdateGoalParams,
} from '../../business/goals/types';
import { Goal, IGoal } from '../../models/goals';

export class GetGoalsRepository implements IGetGoalsRepository {
  async getGoals(): Promise<IGoal[]> {
    const goals = await Goal.find();

    return goals.sort((a, b) => a.orderId - b.orderId);
  }
}

export class CreateGoalRepository implements ICreateGoalRepository {
  async create(params: CreateGoalParams): Promise<IGoal> {
    const goal = await Goal.findOne({
      name: params.name,
    });

    if (goal) {
      throw new Error('Goal already created.');
    }

    const { id } = await Goal.create(params);

    const createdGoal = await Goal.findById(id);

    if (!createdGoal) {
      throw new Error('Goal not created.');
    }

    return createdGoal;
  }
}

export class UpdateGoalRepository implements IUpdateGoalRepository {
  async update(params: UpdateGoalParams, id: string): Promise<IGoal> {
    const goal = await Goal.findById(id);

    if (!goal) {
      throw new Error('Goal not found.');
    }

    const newGoal = await Goal.findByIdAndUpdate(id, params, { upsert: true, returnOriginal: false });

    if (!newGoal) {
      throw new Error('Goal not updated.');
    }

    return newGoal;
  }
}

export class DeleteGoalRepository implements IDeleteGoalRepository {
  async delete(id: string): Promise<{ success: boolean }> {
    const objectId = new mongoose.Types.ObjectId(id);

    const goal = await Goal.findById(objectId);

    if (!goal) {
      throw new Error('Goal not found.');
    }

    const deletedGoal = await Goal.findOneAndDelete(objectId);

    return { success: !!deletedGoal };
  }
}
