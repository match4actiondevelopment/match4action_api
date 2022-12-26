import mongoose from 'mongoose';
import { IInitiative, Initiative } from './model';
import {
  CreateInitiativeParams,
  ICreateInitiativeRepository,
  IDeleteInitiativeRepository,
  IGetInitiativeRepository,
  IGetInitiativesRepository,
} from './types';

export class GetInitiativesRepository implements IGetInitiativesRepository {
  async getAll(): Promise<IInitiative[]> {
    const initiatives = await Initiative.find();

    return initiatives;
  }
}

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
