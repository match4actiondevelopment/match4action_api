import { IInitiative } from '../../../models/initiative';

export interface IGetInitiativesRepository {
  getAll(): Promise<IInitiative[]>;
}

export interface CreateInitiativeParams {
  image: string[];
  eventTimeFrame: string;
  eventType: string;
  name: string;
  moves: string;
  areas: string;
  services: string;
  description: string;
  startDate: string;
  endDate: string;
  postalCode: string;
  city: string;
  country: string;
  createdByUser: string;
  goals: string[];
}

export interface ICreateInitiativeRepository {
  create(params: CreateInitiativeParams): Promise<IInitiative>;
}

export interface IGetInitiativeRepository {
  getOne(id: string): Promise<IInitiative>;
}

export interface IDeleteInitiativeRepository {
  delete(id: string): Promise<{ success: boolean }>;
}
