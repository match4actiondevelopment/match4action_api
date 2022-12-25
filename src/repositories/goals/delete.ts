import mongoose from 'mongoose';
import { IDeleteGoalRepository } from '../../controllers/goals/types';
import { Goal } from '../../models/goals';

export class DeleteGoalRepository implements IDeleteGoalRepository {
  async delete(id: string): Promise<{ success: boolean }> {
    const objectId = new mongoose.Types.ObjectId(id);

    const goal = await Goal.findById(objectId);

    if (!goal) {
      throw new Error('User not created');
    }

    const deletedGoal = await Goal.findOneAndDelete(objectId);

    return { success: !!deletedGoal };
  }
}