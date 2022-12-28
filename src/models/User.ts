import { model, Schema } from 'mongoose';

export interface UserInterface {
  name: string;
  password?: string;
  email: string;
  location?: string;
  bio?: string;
  photo?: string;
  role: string;
  provider?: string;
  googleId?: string;
}

export const User = model(
  'User',
  new Schema<UserInterface>(
    {
      email: {
        type: String,
        minLength: 7,
        lowercase: true,
        unique: true,
      },
      name: {
        type: String,
        required: true,
      },
      password: {
        type: String,
      },
      bio: {
        type: String,
      },
      photo: {
        type: String,
      },
      googleId: {
        type: String,
        unique: true,
      },
      provider: {
        type: String,
        enum: ['google', 'none'],
        default: 'none',
      },
      role: {
        type: String,
        enum: ['user', 'admin', 'super_admin'],
        default: 'user',
      },
    },
    {
      timestamps: true,
    }
  )
);
