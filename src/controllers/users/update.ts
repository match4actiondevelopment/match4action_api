import validator from 'validator';
import { IUser } from '../../models/user';
import { badRequest, ok, serverError } from '../../utils/helpers';
import { HttpRequest, HttpResponse, IController } from '../protocols';
import { CreateUserParams, IUpdateUserRepository, UpdateUserParams } from './types';

export class UpdateUserController implements IController {
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

      // verify that the user that is requesting to change their data is really him

      const user = await this.updateUserRepository.update(httpRequest.body!, httpRequest?.params?.id);
      return ok<IUser>(user);
    } catch (error) {
      return serverError((error as Error).message);
    }
  }
}
