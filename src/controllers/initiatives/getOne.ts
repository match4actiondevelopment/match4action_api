import { IInitiative } from '../../models/initiative';
import { ok, serverError } from '../../utils/helpers';
import { HttpRequest, HttpResponse, IController } from '../protocols';
import { IGetInitiativeRepository } from './types';

export class GetInitiativeController implements IController {
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
