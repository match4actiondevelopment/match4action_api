import { IGetInitiativesRepository } from '../../controllers/initiatives/types';
import { IInitiative, Initiative } from '../../models/initiative';

export class GetInitiativesRepository implements IGetInitiativesRepository {
  async getAll(): Promise<IInitiative[]> {
    const initiatives = await Initiative.find();
    // .populate({ path: 'goals' })
    // .populate({ path: 'createdByUser', select: ['firstName', 'lastName'] })
    // .populate({ path: 'subscribedUsers', select: ['firstName', 'lastName'] });

    return initiatives;
  }
}
