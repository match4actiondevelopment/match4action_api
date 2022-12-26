import validator from 'validator';
import { IUser } from '../../models/user';
import { hashPassword } from '../../utils/bcrypt';
import { badRequest, created, ok, serverError } from '../../utils/helpers';
import { createJWT } from '../../utils/jwt';
import { HttpRequest, HttpResponse, IBusiness } from '../protocols';
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
} from './types';

export class GetUsersBusiness implements IBusiness {
  constructor(private readonly getUsersRepository: IGetUsersRepository) {}

  async handle(): Promise<HttpResponse<IUser[] | string>> {
    try {
      const users = await this.getUsersRepository.getUsers();
      return ok<IUser[]>(users);
    } catch (error) {
      return serverError((error as Error).message);
    }
  }
}

export class GetUserBusiness implements IBusiness {
  constructor(private readonly getUserRepository: IGetUserRepository) {}

  async handle(httpRequest: HttpRequest<null>): Promise<HttpResponse<IUser | string>> {
    try {
      const user = await this.getUserRepository.get(httpRequest?.params?.id);
      return ok<IUser>(user);
    } catch (error) {
      return serverError((error as Error).message);
    }
  }
}

export class SignInUserBusiness implements IBusiness {
  constructor(private readonly signInUserRepository: ISignInUserRepository) {}
  async handle(httpRequest: HttpRequest<CreateUserParams>): Promise<HttpResponse<{ token: string } | string>> {
    try {
      const requiredFields = ['email', 'password'];

      for (const field of requiredFields) {
        if (!httpRequest?.body?.[field as keyof SignInUserParams]?.length) {
          return badRequest(`Field ${field} is required.`);
        }
      }

      const emailIsValid = validator.isEmail(httpRequest?.body!.email);

      if (!emailIsValid) {
        return badRequest('Email is invalid.');
      }

      const user = await this.signInUserRepository.signIn(httpRequest.body!);

      const token = createJWT(user);

      return ok<{ token: string }>({ token });
    } catch (error) {
      return serverError((error as Error).message);
    }
  }
}

export class CreateUserBusiness implements IBusiness {
  constructor(private readonly createUserRepository: ICreateUsersRepository) {}
  async handle(httpRequest: HttpRequest<CreateUserParams>): Promise<HttpResponse<IUser | string>> {
    try {
      const requiredFields = ['firstName', 'lastName', 'email', 'password'];

      for (const field of requiredFields) {
        if (!httpRequest?.body?.[field as keyof CreateUserParams]?.length) {
          return badRequest(`Field ${field} is required.`);
        }
      }

      const emailIsValid = validator.isEmail(httpRequest?.body!.email);

      if (!emailIsValid) {
        return badRequest('Email is invalid.');
      }

      const newPassword = await hashPassword(httpRequest?.body!.password);

      const user = await this.createUserRepository.createUser({
        ...httpRequest.body!,
        password: newPassword,
      });

      const token = createJWT(user);

      return created<IUser>({ user, token });
    } catch (error) {
      return serverError((error as Error).message);
    }
  }
}

export class UpdateUserBusiness implements IBusiness {
  constructor(private readonly updateUserRepository: IUpdateUserRepository) {}
  async handle(httpRequest: HttpRequest<UpdateUserParams>): Promise<HttpResponse<IUser | string>> {
    try {
      const requiredFields = ['firstName', 'lastName', 'email', 'password'];

      for (const field of requiredFields) {
        if (!httpRequest?.body?.[field as keyof CreateUserParams]?.length) {
          return badRequest(`Field ${field} is required.`);
        }
      }

      const emailIsValid = validator.isEmail(httpRequest.body!.email);

      if (!emailIsValid) {
        return badRequest('Email is invalid.');
      }

      const newPassword = await hashPassword(httpRequest?.body!.password);

      // verify that the user that is requesting to change their data is really him

      const user = await this.updateUserRepository.update(
        {
          ...httpRequest.body!,
          password: newPassword,
        },
        httpRequest?.params?.id
      );
      return ok<IUser>(user);
    } catch (error) {
      return serverError((error as Error).message);
    }
  }
}

export class DeleteUserBusiness implements IBusiness {
  constructor(private readonly deleteUserRepository: IDeleteUserRepository) {}
  async handle(httpRequest: HttpRequest<unknown>): Promise<HttpResponse<{ success: boolean } | string>> {
    try {
      const isSuccess = await this.deleteUserRepository.delete(httpRequest?.params?.id);

      return ok<{ success: boolean }>(isSuccess);
    } catch (error) {
      return serverError((error as Error).message);
    }
  }
}
