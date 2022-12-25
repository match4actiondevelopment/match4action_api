import { badRequest, ok, serverError } from '../../utils/helpers';
import { HttpRequest, HttpResponse, IController } from '../protocols';
import { IDeleteGoalRepository } from './types';

export class DeleteGoalController implements IController {
  constructor(private readonly deleteGoalRepository: IDeleteGoalRepository) {}
  async handle(httpRequest: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      if (!httpRequest.params.id) {
        return badRequest(`Param 'id' is required`);
      }

      const isSuccess = await this.deleteGoalRepository.delete(httpRequest.params.id);
      console.log('isSuccess', isSuccess);
      return ok<{ success: boolean }>(isSuccess);
    } catch (error) {
      return serverError();
    }
  }
}
