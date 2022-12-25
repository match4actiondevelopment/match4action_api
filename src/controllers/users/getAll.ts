import { IUser } from '../../models/user';
import { ok, serverError } from '../../utils/helpers';
import { HttpResponse, IController } from '../protocols';
import { IGetUsersRepository } from './types';

export class GetUsersController implements IController {
  constructor(private readonly getUsersRepository: IGetUsersRepository) {}

  async handle(): Promise<HttpResponse<IUser[] | string>> {
    try {
      const users = await this.getUsersRepository.getUsers();
      return ok<IUser[]>(users);
    } catch (error) {
      return serverError((error as Error).message);
    }
  }
}
