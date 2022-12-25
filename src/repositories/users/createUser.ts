import { CreateUserParams, ICreateUsersRepository } from '../../controllers/users/types';
import { IUser, User } from '../../models/user';

export class CreateUserRepository implements ICreateUsersRepository {
  async createUser(params: CreateUserParams): Promise<IUser> {
    const { id } = await User.create(params);

    const user = await User.findById(id);

    if (!user) {
      throw new Error('User not created.');
    }

    return user;
  }
}
