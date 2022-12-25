import { UserI } from '../../../models/user';

export interface IGetUsersRepository {
  getUsers(): Promise<UserI[]>;
}

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

export interface IGetUserRepository {
  get(id: string): Promise<UserI>;
}

export interface IDeleteUserRepository {
  delete(id: string): Promise<{ success: boolean }>;
}
