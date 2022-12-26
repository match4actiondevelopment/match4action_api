import { NextFunction, Request, Response } from 'express';
import {
  CreateInitiativeBusiness,
  DeleteInitiativeBusiness,
  GetInitiativeBusiness,
  GetInitiativesBusiness,
} from './business';
import {
  CreateInitiativeRepository,
  DeleteInitiativeRepository,
  GetInitiativeRepository,
  GetInitiativesRepository,
} from './repository';

/*
  repositories
*/
const getInitiativesRepository = new GetInitiativesRepository();
const getInitiativeRepository = new GetInitiativeRepository();
const createInitiativeRepository = new CreateInitiativeRepository();
const deleteInitiativeRepository = new DeleteInitiativeRepository();

/*
  businesses
*/
const getInitiativesBusiness = new GetInitiativesBusiness(getInitiativesRepository);
const createInitiativeBusiness = new CreateInitiativeBusiness(createInitiativeRepository);
const getInitiativeBusiness = new GetInitiativeBusiness(getInitiativeRepository);
const deleteInitiativeBusiness = new DeleteInitiativeBusiness(deleteInitiativeRepository);

export class InitiativesController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    const { body, statusCode } = await getInitiativesBusiness.handle();
    res.status(statusCode).send(body);
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    const { body, statusCode } = await getInitiativeBusiness.handle({ params: req.params });
    res.status(statusCode).send(body);
  }

  async create(req: Request, res: Response, next: NextFunction) {
    const { body, statusCode } = await createInitiativeBusiness.handle({ body: req.body });
    res.status(statusCode).send(body);
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const { body, statusCode } = await deleteInitiativeBusiness.handle({ params: req.params });
    res.status(statusCode).send(body);
  }
}
