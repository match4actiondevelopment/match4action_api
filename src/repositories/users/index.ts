import mongoose from 'mongoose';
import {
  CreateUserParams,
  ICreateUsersRepository,
  IDeleteUserRepository,
  IGetUserRepository,
  IGetUsersRepository,
  ISignInUserRepository,
  IUpdateUserRepository,
  SignInUserParams,
  UpdateUserParams,
} from '../../business/users/types';
import { IUser, User } from '../../models/user';
import { comparePasswords } from '../../utils/bcrypt';

export class GetUsersRepository implements IGetUsersRepository {
  async getUsers(): Promise<IUser[]> {
    const users = await User.find();
    return users;
  }
}

export class GetUserRepository implements IGetUserRepository {
  async get(id: string): Promise<IUser> {
    const user = await User.findById(id);

    if (!user) {
      throw new Error('User not found.');
    }

    return user;
  }
}

export class SignInUserRepository implements ISignInUserRepository {
  async signIn(params: SignInUserParams): Promise<IUser> {
    const user = await User.findOne({
      email: params.email,
    });

    if (!user) {
      throw new Error('Email or password incorrect.');
    }

    const isValid = await comparePasswords(params.password, user.password);

    if (!isValid) {
      throw new Error('Email or password incorrect.');
    }

    return user;
  }
}

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

export class UpdateUserRepository implements IUpdateUserRepository {
  async update(params: UpdateUserParams, id: string): Promise<IUser> {
    const user = await User.findById(id);

    if (!user) {
      throw new Error('User not found.');
    }

    const newUser = await User.findByIdAndUpdate(id, params, { upsert: true, returnOriginal: false });

    if (!newUser) {
      throw new Error('User not updated.');
    }

    return newUser;
  }
}

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
