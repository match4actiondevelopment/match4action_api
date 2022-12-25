import { CreateUserParams, ICreateUsersRepository } from '../../controllers/users/types';
import { User, UserI } from '../../models/user';

export class CreateUserRepository implements ICreateUsersRepository {
  async createUser(params: CreateUserParams): Promise<UserI> {
    const { id } = await User.create(params);

    const user = await User.findById(id);

    if (!user) {
      throw new Error('User not created.');
    }

    return user;
  }
}
