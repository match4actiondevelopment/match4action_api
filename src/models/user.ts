import { model, Schema } from 'mongoose';

export interface UserI {
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
  new Schema<UserI>({
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
