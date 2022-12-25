import { IGetUsersRepository } from '../../controllers/users/types';
import { IUser, User } from '../../models/user';

export class GetUsersRepository implements IGetUsersRepository {
  async getUsers(): Promise<IUser[]> {
    const users = await User.find();
    return users;
  }
}
