import { IGetUserRepository } from '../../business/users/types';
import { IUser, User } from '../../models/user';

export class GetUserRepository implements IGetUserRepository {
  async get(id: string): Promise<IUser> {
    const user = await User.findById(id);

    if (!user) {
      throw new Error('User not found.');
    }

    return user;
  }
}
