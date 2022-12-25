import { IGetGoalsRepository } from '../../controllers/goals/types';
import { Goal, GoalI } from '../../models/goals';

export class GetGoalsRepository implements IGetGoalsRepository {
  async getGoals(): Promise<GoalI[]> {
    const goals = await Goal.find();

    return goals.sort((a, b) => a.orderId - b.orderId);
  }
}
