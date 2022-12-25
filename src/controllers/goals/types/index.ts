import { GoalI } from '../../../models/goals';

export interface CreateGoalParams {
  orderId: number;
  name: string;
}

export interface ICreateGoalRepository {
  create(params: CreateGoalParams): Promise<GoalI>;
}

export interface IGetGoalsRepository {
  getGoals(): Promise<GoalI[]>;
}

export interface IDeleteGoalRepository {
  delete(id: string): Promise<{ success: boolean }>;
}
