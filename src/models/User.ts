import mongoose, { Document } from 'mongoose';

const Schema = mongoose.Schema;

export enum UserRole {
  'volunteer',
  'admin',
  'organization',
}

export type UserDocument = Document & {
  name: string;
  email: string;
  termsAndConditions: boolean;
  provider: {
    name: string;
    id: string;
  };
  image?: string;
  birthDate?: Date;
  password?: string;
  location?: {
    city: string;
    country: string;
  };
  bio?: string;
  role?: UserRole;
  answers?: Record<string, any>;
};

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
    },
    image: {
      type: String,
    },
    birthDate: {
      type: Date,
    },
    role: {
      type: String,
      enum: UserRole,
      default: 'volunteer',
    },
    bio: {
      type: String,
    },
    provider: {
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      }
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
    termsAndConditions: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<UserDocument>('User', userSchema);
