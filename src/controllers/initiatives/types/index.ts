import { InitiativeI } from '../../../models/initiative';

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
  create(params: CreateInitiativeParams): Promise<InitiativeI>;
}
