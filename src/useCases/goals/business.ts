import { badRequest, created, ok, serverError } from '../../utils/helpers';
import { HttpRequest, HttpResponse, IBusiness } from '../../utils/protocols';
import { IGoal } from './model';
import {
  CreateGoalParams,
  ICreateGoalRepository,
  IDeleteGoalRepository,
  IGetGoalsRepository,
  IUpdateGoalRepository,
  UpdateGoalParams,
} from './types';

export class GetGoalsBusiness implements IBusiness {
  constructor(private readonly getGoalsRepository: IGetGoalsRepository) {}

  async handle(): Promise<HttpResponse<IGoal[] | string>> {
    try {
      const goals = await this.getGoalsRepository.getGoals();
      return ok<IGoal[]>(goals);
    } catch (error) {
      return serverError((error as Error).message);
    }
  }
}

export class CreateGoalBusiness implements IBusiness {
  constructor(private readonly createGoalRepository: ICreateGoalRepository) {}
  async handle(httpRequest: HttpRequest<CreateGoalParams>): Promise<HttpResponse<IGoal | string>> {
    try {
      const requiredFields = ['name', 'orderId'];

      for (const field of requiredFields) {
        if (!httpRequest?.body?.[field as keyof CreateGoalParams]?.toString()?.length) {
          return badRequest(`Field ${field} is required.`);
        }
      }

      const goal = await this.createGoalRepository.create(httpRequest.body!);
      return created<IGoal>(goal);
    } catch (error) {
      return serverError((error as Error).message);
    }
  }
}

export class UpdateGoalBusiness implements IBusiness {
  constructor(private readonly updateGoalRepository: IUpdateGoalRepository) {}
  async handle(httpRequest: HttpRequest<UpdateGoalParams>): Promise<HttpResponse<IGoal | string>> {
    try {
      const requiredFields = ['name', 'orderId'];

      for (const field of requiredFields) {
        if (!httpRequest?.body?.[field as keyof UpdateGoalParams]?.toString()?.length) {
          return badRequest(`Field ${field} is required.`);
        }
      }

      const goal = await this.updateGoalRepository.update(httpRequest.body!, httpRequest?.params?.id);
      return ok<IGoal>(goal);
    } catch (error) {
      return serverError((error as Error).message);
    }
  }
}

export class DeleteGoalBusiness implements IBusiness {
  constructor(private readonly deleteGoalRepository: IDeleteGoalRepository) {}
  async handle(httpRequest: HttpRequest<unknown>): Promise<HttpResponse<{ success: boolean } | string>> {
    try {
      const isSuccess = await this.deleteGoalRepository.delete(httpRequest?.params?.id);

      return ok<{ success: boolean }>(isSuccess);
    } catch (error) {
      return serverError((error as Error).message);
    }
  }
}
