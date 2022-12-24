import { CreateUserParams, ICreateUsersRepository } from '../../controllers/create-user/protocols';
import { mongoClient } from '../../database/config';
import { User } from '../../models/user';

export class CreateUserRepository implements ICreateUsersRepository {
  async createUser(params: CreateUserParams): Promise<User> {
    const { insertedId } = await mongoClient.db.collection('users').insertOne(params);

    const user = await mongoClient.db.collection<Omit<User, 'id'>>('users').findOne({
      _id: insertedId,
    });

    if (!user) {
      throw new Error('User not created');
    }

    const { _id, ...rest } = user;

    return { id: _id.toHexString(), ...rest };
  }
}
