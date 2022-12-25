import { ok, serverError } from '../../utils/helpers';
import { HttpRequest, HttpResponse, IController } from '../protocols';
import { IDeleteUserRepository } from './types';

export class DeleteUserController implements IController {
  constructor(private readonly deleteUserRepository: IDeleteUserRepository) {}
  async handle(httpRequest: HttpRequest<unknown>): Promise<HttpResponse<{ success: boolean } | string>> {
    try {
      const isSuccess = await this.deleteUserRepository.delete(httpRequest?.params?.id);

      return ok<{ success: boolean }>(isSuccess);
    } catch (error) {
      return serverError((error as Error).message);
    }
  }
}
