import { UserI } from '../../../models/user';

export interface IGetUsersRepository {
  getUsers(): Promise<UserI[]>;
}
