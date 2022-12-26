import { IUpdateUserRepository, UpdateUserParams } from '../../controllers/users/types';
import { IUser, User } from '../../models/user';

export class UpdateUserRepository implements IUpdateUserRepository {
  async update(params: UpdateUserParams, id: string): Promise<IUser> {
    const user = await User.findById(id);

    if (!user) {
      throw new Error('User not found.');
    }

    const newUser = await User.findByIdAndUpdate(id, params, { upsert: true });

    if (!newUser) {
      throw new Error('User not updated.');
    }

    return newUser;
  }
}
