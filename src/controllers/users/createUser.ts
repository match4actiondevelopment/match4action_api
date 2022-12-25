import validator from 'validator';
import { UserI } from '../../models/user';
import { badRequest, created, serverError } from '../../utils/helpers';
import { HttpRequest, HttpResponse, IController } from '../protocols';
import { CreateUserParams, ICreateUsersRepository } from './types';

export class CreateUserController implements IController {
  constructor(private readonly createUserRepository: ICreateUsersRepository) {}
  async handle(httpRequest: HttpRequest<CreateUserParams>): Promise<HttpResponse<UserI | string>> {
    try {
      const requiredFields = ['firstName', 'lastName', 'email', 'password'];

      for (const field of requiredFields) {
        if (!httpRequest?.body?.[field as keyof CreateUserParams]?.length) {
          return badRequest(`Field ${field} is required`);
        }
      }

      const emailIsValid = validator.isEmail(httpRequest.body!.email);

      if (!emailIsValid) {
        return badRequest('Email is invalid');
      }

      const user = await this.createUserRepository.createUser(httpRequest.body!);
      return created<UserI>(user);
    } catch (error) {
      return serverError();
    }
  }
}
