import { IGoal } from '../../../models/goals';

export interface CreateGoalParams {
  orderId: number;
  name: string;
}

export interface ICreateGoalRepository {
  create(params: CreateGoalParams): Promise<IGoal>;
}

export interface IGetGoalsRepository {
  getGoals(): Promise<IGoal[]>;
}

export interface IDeleteGoalRepository {
  delete(id: string): Promise<{ success: boolean }>;
}
