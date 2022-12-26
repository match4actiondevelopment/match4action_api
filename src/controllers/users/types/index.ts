import { IUser } from '../../../models/user';

export interface IGetUsersRepository {
  getUsers(): Promise<IUser[]>;
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
  createUser(params: CreateUserParams): Promise<IUser>;
}

export interface IGetUserRepository {
  get(id: string): Promise<IUser>;
}

export interface IDeleteUserRepository {
  delete(id: string): Promise<{ success: boolean }>;
}

export interface UpdateUserParams {
  id: string;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  location?: string;
  bio?: string;
  profileImage?: string;
}

export interface IUpdateUserRepository {
  update(params: UpdateUserParams, id: string): Promise<IUser>;
}

export interface SignInUserParams {
  password: string;
  email: string;
}
export interface ISignInUserRepository {
  signIn(params: SignInUserParams): Promise<IUser>;
}
