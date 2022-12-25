import { UserI } from '../../../models/user';

export interface CreateUserParams {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  location?: string;
  bio?: string;
  profileImage?: string;
}

export interface ICreateUsersRepository {
  createUser(params: CreateUserParams): Promise<UserI>;
}
