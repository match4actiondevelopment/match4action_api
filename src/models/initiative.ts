import { model, Schema } from 'mongoose';
import { GoalI } from './goals';
import { UserI } from './user';

export interface InitiativeI {
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
  createdByUser: UserI;
  subscribedUsers: UserI[];
  goals: GoalI[];
  createdAt: Date;
}

export const Initiative = model(
  'Initiative',
  new Schema<InitiativeI>({
    image: {
      type: [String],
      required: true,
    },
    eventTimeFrame: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      enum: ['IN_PERSON', 'REMOTE', 'BOTH'],
      default: 'REMOTE',
    },
    name: {
      type: String,
      required: true,
    },
    moves: {
      type: String,
      required: true,
    },
    areas: {
      type: String,
      required: true,
    },
    services: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    createdByUser: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    subscribedUsers: {
      type: [
        {
          user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
          },
        },
      ],
    },
    goals: {
      required: true,
      type: [
        {
          goal: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Goal',
          },
        },
      ],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  })
);