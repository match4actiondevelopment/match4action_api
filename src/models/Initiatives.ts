import mongoose, { Document, ObjectId, Schema } from 'mongoose';

export type InitiativeDocument = Document & {
  eventItemFrame: string;
  eventItemType: string;
  initiativeName: string;
  whatMovesThisInitiative: string;
  whichAreasAreCoveredByThisInitiative: string;
  servicesNeeded: string;
  description: string;
  startDate: Date;
  endDate: Date;
  startTime: Date;
  endTime: Date;
  postalCode: string;
  website: string;
  location: {
    country: string;
    city: string;
  };
  image?: string[];
  userId: ObjectId;
  goals: ObjectId[];
  applicants: ObjectId[];
};

const initiativeSchema = new Schema<InitiativeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    eventItemFrame: {
      type: String,
    },
    eventItemType: {
      type: String,
    },
    initiativeName: {
      type: String,
    },
    whatMovesThisInitiative: {
      type: String,
    },
    whichAreasAreCoveredByThisInitiative: {
      type: String,
    },
    servicesNeeded: {
      type: String,
    },
    description: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    postalCode: {
      type: String,
    },
    website: {
      type: String,
    },
    location: {
      country: {
        type: String,
      },
      city: {
        type: String,
      },
    },
    image: [
      {
        type: String,
      },
    ],
    goals: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Goal',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Initiative = mongoose.model<InitiativeDocument>('Initiative', initiativeSchema);
