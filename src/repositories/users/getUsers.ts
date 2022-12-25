import { IGetUsersRepository } from '../../controllers/users/types';
import { User, UserI } from '../../models/user';

export class GetUsersRepository implements IGetUsersRepository {
  async getUsers(): Promise<UserI[]> {
    const users = await User.find();
    return users;
  }
}
