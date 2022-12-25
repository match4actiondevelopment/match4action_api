import { UserI } from '../../models/user';
import { badRequest, ok, serverError } from '../../utils/helpers';
import { HttpRequest, HttpResponse, IController } from '../protocols';
import { IGetUserRepository } from './types';

export class GetUserController implements IController {
  constructor(private readonly getUserRepository: IGetUserRepository) {}

  async handle(httpRequest: HttpRequest<null>): Promise<HttpResponse<UserI | string>> {
    try {
      if (!httpRequest?.params?.id) {
        return badRequest(`Param 'id' is required`);
      }

      const user = await this.getUserRepository.get(httpRequest?.params?.id);
      return ok<UserI>(user);
    } catch (error) {
      return serverError();
    }
  }
}
