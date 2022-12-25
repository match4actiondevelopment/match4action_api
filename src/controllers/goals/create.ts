import { GoalI } from '../../models/goals';
import { badRequest, created, serverError } from '../../utils/helpers';
import { HttpRequest, HttpResponse, IController } from '../protocols';
import { CreateGoalParams, ICreateGoalRepository } from './types';

export class CreateGoalController implements IController {
  constructor(private readonly createGoalRepository: ICreateGoalRepository) {}
  async handle(httpRequest: HttpRequest<CreateGoalParams>): Promise<HttpResponse<GoalI | string>> {
    try {
      const requiredFields = ['name', 'orderId'];

      for (const field of requiredFields) {
        if (!httpRequest?.body?.[field as keyof CreateGoalParams]?.toString()?.length) {
          return badRequest(`Field ${field} is required`);
        }
      }

      const goal = await this.createGoalRepository.create(httpRequest.body!);
      return created<GoalI>(goal);
    } catch (error) {
      return serverError();
    }
  }
}
