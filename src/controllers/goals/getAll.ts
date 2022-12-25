import { IGoal } from '../../models/goals';
import { ok, serverError } from '../../utils/helpers';
import { HttpResponse, IController } from '../protocols';
import { IGetGoalsRepository } from './types';

export class GetGoalsController implements IController {
  constructor(private readonly getGoalsRepository: IGetGoalsRepository) {}

  async handle(): Promise<HttpResponse<IGoal[] | string>> {
    try {
      const goals = await this.getGoalsRepository.getGoals();
      return ok<IGoal[]>(goals);
    } catch (error) {
      return serverError((error as Error).message);
    }
  }
}
