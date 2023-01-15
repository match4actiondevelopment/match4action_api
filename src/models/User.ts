import { model, Schema } from 'mongoose';

export enum UserRole {
  'volunteer',
  'admin',
  'organization',
}

export interface UserInterface {
  name: string;
  password?: string;
  email: string;
  image?: string;
  termsAndConditions: boolean;
  role?: UserRole;
  birthDate?: Date;
  bio?: string;
  location: {
    city: string;
    country: string;
  };
  provider?: string;
  answers: Record<string, any>;
}

export const User = model(
  'User',
  new Schema<UserInterface>(
    {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
      },
      password: {
        type: String,
      },
      role: {
        type: String,
        enum: UserRole,
        default: 'volunteer',
      },
      image: {
        type: String,
      },
      birthDate: {
        type: Date,
      },
      bio: {
        type: String,
      },
      provider: {
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
      answers: {},
      termsAndConditions: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  )
);
