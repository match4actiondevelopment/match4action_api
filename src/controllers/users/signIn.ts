import validator from 'validator';
import { badRequest, ok, serverError } from '../../utils/helpers';
import { createJWT } from '../../utils/jwt';
import { HttpRequest, HttpResponse, IController } from '../protocols';
import { CreateUserParams, ISignInUserRepository, SignInUserParams } from './types';

export class SignInUserController implements IController {
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
