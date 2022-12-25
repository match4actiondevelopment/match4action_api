import { UserI } from '../../models/user';
import { ok, serverError } from '../../utils/helpers';
import { HttpResponse, IController } from '../protocols';
import { IGetUsersRepository } from './types';

export class GetUsersController implements IController {
  constructor(private readonly getUsersRepository: IGetUsersRepository) {}

  async handle(): Promise<HttpResponse<UserI[] | string>> {
    try {
      const users = await this.getUsersRepository.getUsers();
      return ok<UserI[]>(users);
    } catch (error) {
      return serverError();
    }
  }
}
