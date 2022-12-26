import { IUpdateGoalRepository, UpdateGoalParams } from '../../controllers/goals/types';
import { Goal, IGoal } from '../../models/goals';

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
