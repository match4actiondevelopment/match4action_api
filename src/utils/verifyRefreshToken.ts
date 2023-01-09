import jwt, { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken';
import { UserRole } from '../models/User';
import { UserToken } from '../models/UserToken';
import { REFRESH_TOKEN_PRIVATE_KEY } from './constants';

export interface UserJWTPayload {
  _id: string;
  role: UserRole;
  email: string;
  iat: number;
  exp: number;
}

export interface VerifyRefreshTokenSuccessResponse {
  tokenDetails: UserJWTPayload;
  success: boolean;
  message: string;
}

export const verifyRefreshToken = (refreshToken: string) => {
  return new Promise((resolve, reject) => {
    UserToken.findOne({ token: refreshToken }, (err: any, doc: any) => {
      if (!doc) return reject({ error: true, message: 'Invalid refresh token.' });

      jwt.verify(refreshToken, REFRESH_TOKEN_PRIVATE_KEY, (err, tokenDetails) => {
        if (err instanceof TokenExpiredError) {
          reject({
            success: false,
            message: 'Unauthorized! Access Token was expired!',
          });
        }
        if (err instanceof NotBeforeError) {
          reject({
            success: false,
            message: 'Jwt not active,',
          });
        }
        if (err instanceof JsonWebTokenError) {
          reject({
            success: false,
            message: 'Jwt malformed.',
          });
        }

        if (tokenDetails)
          resolve({
            tokenDetails,
            success: true,
            message: 'Valid refresh token.',
          });
      });
    });
  });
};
