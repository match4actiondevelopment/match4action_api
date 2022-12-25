import { IGetUserRepository } from '../../controllers/users/types';
import { User, UserI } from '../../models/user';

export class GetUserRepository implements IGetUserRepository {
  async get(id: string): Promise<UserI> {
    const user = await User.findById(id);

    if (!user) {
      throw new Error('User not found.');
    }

    return user;
  }
}
