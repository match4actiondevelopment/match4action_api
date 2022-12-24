import { IGetUsersRepository } from '../../controllers/get-users/protocols';
import { mongoClient } from '../../database/config';
import { User } from '../../models/user';

export class GetUsersRepository implements IGetUsersRepository {
  async getUsers(): Promise<User[]> {
    const users = await mongoClient.db.collection<User>('users').find().toArray();
    return users;
  }
}
