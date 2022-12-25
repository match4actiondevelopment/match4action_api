import { IGetInitiativeRepository } from '../../controllers/initiatives/types';
import { IInitiative, Initiative } from '../../models/initiative';

export class GetInitiativeRepository implements IGetInitiativeRepository {
  async getOne(id: string): Promise<IInitiative> {
    const initiative = await Initiative.findById(id)
      .populate({ path: 'goals' })
      .populate({ path: 'createdByUser', select: ['firstName', 'lastName'] })
      .populate({ path: 'subscribedUsers', select: ['firstName', 'lastName'] });

    if (!initiative) {
      throw new Error('Initiative not found.');
    }

    return initiative;
  }
}
