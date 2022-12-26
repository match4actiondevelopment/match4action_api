import validator from 'validator';
import { IUser } from '../../models/user';
import { hashPassword } from '../../utils/bcrypt';
import { badRequest, created, serverError } from '../../utils/helpers';
import { createJWT } from '../../utils/jwt';
import { HttpRequest, HttpResponse, IController } from '../protocols';
import { CreateUserParams, ICreateUsersRepository } from './types';

export class CreateUserController implements IController {
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
