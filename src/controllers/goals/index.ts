import { NextFunction, Request, Response } from 'express';
import { CreateGoalBusiness, DeleteGoalBusiness, GetGoalsBusiness, UpdateGoalBusiness } from '../../business/goals';
import {
  CreateGoalRepository,
  DeleteGoalRepository,
  GetGoalsRepository,
  UpdateGoalRepository,
} from '../../repositories/goals';

/*
  repositories
*/
const getGoalsRepository = new GetGoalsRepository();
const createGoalRepository = new CreateGoalRepository();
const deleteGoalRepository = new DeleteGoalRepository();
const updateGoalRepository = new UpdateGoalRepository();

/*
  businesses
*/
const getGoalsBusiness = new GetGoalsBusiness(getGoalsRepository);
const createGoalBusiness = new CreateGoalBusiness(createGoalRepository);
const deleteGoalBusiness = new DeleteGoalBusiness(deleteGoalRepository);
const updateGoalBusiness = new UpdateGoalBusiness(updateGoalRepository);

export class GoalsController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    const { body, statusCode } = await getGoalsBusiness.handle();
    res.status(statusCode).send(body);
  }

  async create(req: Request, res: Response, next: NextFunction) {
    const { body, statusCode } = await createGoalBusiness.handle({ body: req.body });
    res.status(statusCode).send(body);
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { body, statusCode } = await updateGoalBusiness.handle({ body: req.body, params: req.params });
    res.status(statusCode).send(body);
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const { body, statusCode } = await deleteGoalBusiness.handle({ params: req.params });
    res.status(statusCode).send(body);
  }
}
