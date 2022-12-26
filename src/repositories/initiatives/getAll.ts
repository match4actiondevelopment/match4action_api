import { IGetInitiativesRepository } from '../../business/initiatives/types';
import { IInitiative, Initiative } from '../../models/initiative';

export class GetInitiativesRepository implements IGetInitiativesRepository {
  async getAll(): Promise<IInitiative[]> {
    const initiatives = await Initiative.find();

    return initiatives;
  }
}
