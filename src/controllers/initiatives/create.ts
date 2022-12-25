import { IInitiative } from '../../models/initiative';
import { badRequest, created, serverError } from '../../utils/helpers';
import { HttpRequest, HttpResponse, IController } from '../protocols';
import { CreateInitiativeParams, ICreateInitiativeRepository } from './types';

export class CreateInitiativeController implements IController {
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
