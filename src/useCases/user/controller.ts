import { NextFunction, Request, Response } from 'express';
import {
  CreateUserBusiness,
  DeleteUserBusiness,
  GetUserBusiness,
  GetUsersBusiness,
  SignInUserBusiness,
  UpdateUserBusiness,
} from './business';
import {
  CreateUserRepository,
  DeleteUserRepository,
  GetUserRepository,
  GetUsersRepository,
  SignInUserRepository,
  UpdateUserRepository,
} from './repository';

/*
  repositories
*/
const getUsersRepository = new GetUsersRepository();
const createUserRepository = new CreateUserRepository();
const getUserRepository = new GetUserRepository();
const updateUserRepository = new UpdateUserRepository();
const deleteUserRepository = new DeleteUserRepository();
const signInUserRepository = new SignInUserRepository();

/*
  business
*/
const getUsersBusiness = new GetUsersBusiness(getUsersRepository);
const createUserBusiness = new CreateUserBusiness(createUserRepository);
const getUserBusiness = new GetUserBusiness(getUserRepository);
const updateUserBusiness = new UpdateUserBusiness(updateUserRepository);
const deleteUserBusiness = new DeleteUserBusiness(deleteUserRepository);
const signInUserBusiness = new SignInUserBusiness(signInUserRepository);

export class UsersController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    const { body, statusCode } = await getUsersBusiness.handle();
    res.status(statusCode).send(body);
  }

  async signIn(req: Request, res: Response, next: NextFunction) {
    const { body, statusCode } = await signInUserBusiness.handle({ body: req.body });
    res.status(statusCode).send(body);
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    const { body, statusCode } = await getUserBusiness.handle({ params: req.params });
    res.status(statusCode).send(body);
  }

  async create(req: Request, res: Response, next: NextFunction) {
    const { body, statusCode } = await createUserBusiness.handle({ body: req.body });
    res.status(statusCode).send(body);
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { body, statusCode } = await updateUserBusiness.handle({ body: req.body, params: req.params });
    res.status(statusCode).send(body);
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const { body, statusCode } = await deleteUserBusiness.handle({ params: req.params });
    res.status(statusCode).send(body);
  }
}
