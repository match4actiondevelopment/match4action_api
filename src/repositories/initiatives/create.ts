import { CreateInitiativeParams, ICreateInitiativeRepository } from '../../controllers/initiatives/types';
import { IInitiative, Initiative } from '../../models/initiative';

export class CreateInitiativeRepository implements ICreateInitiativeRepository {
  async create(params: CreateInitiativeParams): Promise<IInitiative> {
    const { id } = await Initiative.create(params);

    const initiative = await Initiative.findById(id);

    if (!initiative) {
      throw new Error('Initiative not created.');
    }

    return initiative;
  }
}
