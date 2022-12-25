import { IUser } from '../../models/user';
import { ok, serverError } from '../../utils/helpers';
import { HttpRequest, HttpResponse, IController } from '../protocols';
import { IGetUserRepository } from './types';

export class GetUserController implements IController {
  constructor(private readonly getUserRepository: IGetUserRepository) {}

  async handle(httpRequest: HttpRequest<null>): Promise<HttpResponse<IUser | string>> {
    try {
      const user = await this.getUserRepository.get(httpRequest?.params?.id);
      return ok<IUser>(user);
    } catch (error) {
      return serverError((error as Error).message);
    }
  }
}
