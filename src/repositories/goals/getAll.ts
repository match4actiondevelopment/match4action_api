import { IGetGoalsRepository } from '../../business/goals/types';
import { Goal, IGoal } from '../../models/goals';

export class GetGoalsRepository implements IGetGoalsRepository {
  async getGoals(): Promise<IGoal[]> {
    const goals = await Goal.find();

    return goals.sort((a, b) => a.orderId - b.orderId);
  }
}
