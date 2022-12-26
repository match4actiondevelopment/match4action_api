import mongoose from 'mongoose';
import { IDeleteInitiativeRepository } from '../../business/initiatives/types';
import { Initiative } from '../../models/initiative';

export class DeleteInitiativeRepository implements IDeleteInitiativeRepository {
  async delete(id: string): Promise<{ success: boolean }> {
    const objectId = new mongoose.Types.ObjectId(id);

    const initiative = await Initiative.findById(objectId);

    if (!initiative) {
      throw new Error('Initiative not found.');
    }

    const deletedInitiative = await Initiative.findOneAndDelete(objectId);

    return { success: !!deletedInitiative };
  }
}
