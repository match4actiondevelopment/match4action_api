import { UserRole } from '../models/User';

export interface UserJWTPayload {
  _id: string;
  role: UserRole;
  email: string;
  iat: number;
  exp: number;
}

export type RefreshTokenSuccessResponse = {
  tokenDetails: UserJWTPayload;
  success: boolean;
  message: string;
};
