import { CreateGoalParams, ICreateGoalRepository } from '../../controllers/goals/types';
import { Goal, IGoal } from '../../models/goals';

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
