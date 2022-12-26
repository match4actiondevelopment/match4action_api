import { ok, serverError } from '../../utils/helpers';
import { HttpRequest, HttpResponse, IController } from '../protocols';
import { IDeleteInitiativeRepository } from './types';

export class DeleteInitiativeController implements IController {
  constructor(private readonly deleteInitiativeRepository: IDeleteInitiativeRepository) {}
  async handle(httpRequest: HttpRequest<unknown>): Promise<HttpResponse<{ success: boolean } | string>> {
    try {
      const isSuccess = await this.deleteInitiativeRepository.delete(httpRequest?.params?.id);

      return ok<{ success: boolean }>(isSuccess);
    } catch (error) {
      return serverError((error as Error).message);
    }
  }
}
