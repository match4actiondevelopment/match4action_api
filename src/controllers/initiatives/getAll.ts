import { IInitiative } from '../../models/initiative';
import { ok, serverError } from '../../utils/helpers';
import { HttpResponse, IController } from '../protocols';
import { IGetInitiativesRepository } from './types';

export class GetInitiativesController implements IController {
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
