import jwt from 'jsonwebtoken';
import { UserToken } from '../models/UserToken';
import { REFRESH_TOKEN_PRIVATE_KEY } from './constants';

export const verifyRefreshToken = (refreshToken: string) => {
  return new Promise((resolve, reject) => {
    UserToken.findOne({ token: refreshToken }, (err: any, doc: any) => {
      if (!doc) return reject({ error: true, message: 'Invalid refresh token.' });

      jwt.verify(refreshToken, REFRESH_TOKEN_PRIVATE_KEY, (err, tokenDetails) => {
        if (err) return reject({ error: true, message: 'Invalid refresh token.' });
        resolve({
          tokenDetails,
          error: false,
          message: 'Valid refresh token.',
        });
      });
    });
  });
};
