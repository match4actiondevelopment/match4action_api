import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';
import { ACCESS_TOKEN_PRIVATE_KEY, ACCESS_TOKEN_PRIVATE_TIME, REFRESH_TOKEN_PRIVATE_KEY, REFRESH_TOKEN_PRIVATE_TIME } from './secrets';

export interface SignJwtInterface {
  _id: string, role: UserRole, email: string
}

export const signJwtAccessToken = (data: SignJwtInterface) => {
  return jwt.sign(
    {
      _id: data._id,
      role: data.role,
      email: data.email,
    },
    ACCESS_TOKEN_PRIVATE_KEY,
    { expiresIn: ACCESS_TOKEN_PRIVATE_TIME }
  );
}

export const signJwtRefreshToken = (data: SignJwtInterface) => {
  return jwt.sign(
    {
      _id: data._id,
      role: data.role,
      email: data.email,
    },
    REFRESH_TOKEN_PRIVATE_KEY,
    { expiresIn: REFRESH_TOKEN_PRIVATE_TIME }
  );
}
