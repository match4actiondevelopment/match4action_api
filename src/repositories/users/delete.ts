import mongoose from 'mongoose';
import { IDeleteUserRepository } from '../../controllers/users/types';
import { User } from '../../models/user';

export class DeleteUserRepository implements IDeleteUserRepository {
  async delete(id: string): Promise<{ success: boolean }> {
    const objectId = new mongoose.Types.ObjectId(id);

    const user = await User.findById(objectId);

    if (!user) {
      throw new Error('User not found.');
    }

    const deletedGoal = await User.findOneAndDelete(objectId);

    return { success: !!deletedGoal };
  }
}
