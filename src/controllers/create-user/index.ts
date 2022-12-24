import { User } from '../../models/user';
import { HttpRequest, HttpResponse } from '../protocols';
import { CreateUserParams, ICreateUsersController, ICreateUsersRepository } from './protocols';

export class CreateUserController implements ICreateUsersController {
  constructor(private readonly createUserRepository: ICreateUsersRepository) {}
  async handle(httpRequest: HttpRequest<CreateUserParams>): Promise<HttpResponse<User>> {
    try {
      if (!httpRequest.body) {
        return {
          statusCode: 400,
          body: 'Please specify a body',
        };
      }
      const user = await this.createUserRepository.createUser(httpRequest.body);
      return {
        statusCode: 201,
        body: user,
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: 'Something went wrong',
      };
    }
  }
}
