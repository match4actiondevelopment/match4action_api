import { model, Schema } from 'mongoose';

export interface IUser {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  location?: string;
  bio?: string;
  profileImage?: string;
}

export const User = model(
  'User',
  new Schema<IUser>({
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    location: {
      type: String,
    },
    bio: {
      type: String,
    },
    profileImage: {
      type: String,
    },
  })
);
