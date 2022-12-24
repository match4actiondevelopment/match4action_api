import { IGetUsersRepository } from '../../controllers/get-users/protocols';
import { User } from '../../models/user';

export class GetUsersRepository implements IGetUsersRepository {
  async getUsers(): Promise<User[]> {
    return [];
  }
}
