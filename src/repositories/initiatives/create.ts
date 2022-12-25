import { CreateInitiativeParams, ICreateInitiativeRepository } from '../../controllers/initiatives/types';
import { Initiative, InitiativeI } from '../../models/initiative';

export class CreateInitiativeRepository implements ICreateInitiativeRepository {
  async create(params: CreateInitiativeParams): Promise<InitiativeI> {
    const { id } = await Initiative.create(params);

    const initiative = await Initiative.findById(id);

    if (!initiative) {
      throw new Error('Initiative not created.');
    }

    return initiative;
  }
}
