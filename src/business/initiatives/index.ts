import { IInitiative } from '../../models/initiative';
import { badRequest, created, ok, serverError } from '../../utils/helpers';
import { HttpRequest, HttpResponse, IBusiness } from '../protocols';
import {
  CreateInitiativeParams,
  ICreateInitiativeRepository,
  IDeleteInitiativeRepository,
  IGetInitiativeRepository,
  IGetInitiativesRepository,
} from './types';

export class GetInitiativeBusiness implements IBusiness {
  constructor(private readonly getInitiativeRepository: IGetInitiativeRepository) {}

  async handle(httpRequest: HttpRequest<null>): Promise<HttpResponse<IInitiative | string>> {
    try {
      const initiative = await this.getInitiativeRepository.getOne(httpRequest?.params?.id);
      return ok<IInitiative>(initiative);
    } catch (error) {
      return serverError((error as Error).message);
    }
  }
}

export class GetInitiativesBusiness implements IBusiness {
  constructor(private readonly getInitiativesRepository: IGetInitiativesRepository) {}

  async handle(): Promise<HttpResponse<IInitiative[] | string>> {
    try {
      const initiatives = await this.getInitiativesRepository.getAll();
      return ok<IInitiative[]>(initiatives);
    } catch (error) {
      return serverError((error as Error).message);
    }
  }
}

export class CreateInitiativeBusiness implements IBusiness {
  constructor(private readonly createInitiativeRepository: ICreateInitiativeRepository) {}
  async handle(httpRequest: HttpRequest<CreateInitiativeParams>): Promise<HttpResponse<IInitiative | string>> {
    try {
      const requiredFields = [
        'image',
        'eventTimeFrame',
        'eventType',
        'name',
        'moves',
        'areas',
        'services',
        'description',
        'startDate',
        'endDate',
        'postalCode',
        'city',
        'country',
        'createdByUser',
        'goals',
      ];

      for (const field of requiredFields) {
        if (!httpRequest?.body?.[field as keyof CreateInitiativeParams]?.toString()?.length) {
          return badRequest(`Field ${field} is required.`);
        }
      }

      const initiative = await this.createInitiativeRepository.create(httpRequest.body!);
      return created<IInitiative>(initiative);
    } catch (error) {
      return serverError((error as Error).message);
    }
  }
}

export class DeleteInitiativeBusiness implements IBusiness {
  constructor(private readonly deleteInitiativeRepository: IDeleteInitiativeRepository) {}
  async handle(httpRequest: HttpRequest<unknown>): Promise<HttpResponse<{ success: boolean } | string>> {
    try {
      const isSuccess = await this.deleteInitiativeRepository.delete(httpRequest?.params?.id);

      return ok<{ success: boolean }>(isSuccess);
    } catch (error) {
      return serverError((error as Error).message);
    }
  }
}
