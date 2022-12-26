import { IGoal } from '../../models/goals';
import { badRequest, ok, serverError } from '../../utils/helpers';
import { HttpRequest, HttpResponse, IController } from '../protocols';
import { IUpdateGoalRepository, UpdateGoalParams } from './types';

export class UpdateGoalController implements IController {
  constructor(private readonly updateGoalRepository: IUpdateGoalRepository) {}
  async handle(httpRequest: HttpRequest<UpdateGoalParams>): Promise<HttpResponse<IGoal | string>> {
    try {
      const requiredFields = ['name', 'orderId'];

      for (const field of requiredFields) {
        if (!httpRequest?.body?.[field as keyof UpdateGoalParams]?.toString()?.length) {
          return badRequest(`Field ${field} is required.`);
        }
      }

      const goal = await this.updateGoalRepository.update(httpRequest.body!, httpRequest?.params?.id);
      return ok<IGoal>(goal);
    } catch (error) {
      return serverError((error as Error).message);
    }
  }
}
