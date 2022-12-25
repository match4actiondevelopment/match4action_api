import { GoalI } from '../../models/goals';
import { ok, serverError } from '../../utils/helpers';
import { HttpResponse, IController } from '../protocols';
import { IGetGoalsRepository } from './types';

export class GetGoalsController implements IController {
  constructor(private readonly getGoalsRepository: IGetGoalsRepository) {}

  async handle(): Promise<HttpResponse<GoalI[] | string>> {
    try {
      const goals = await this.getGoalsRepository.getGoals();
      return ok<GoalI[]>(goals);
    } catch (error) {
      return serverError();
    }
  }
}
