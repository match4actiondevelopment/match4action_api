import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';
import { UserToken } from '../models/UserToken';
import { ACCESS_TOKEN_PRIVATE_KEY, REFRESH_TOKEN_PRIVATE_KEY } from './constants';

export interface GenerateTokensInterface {
  _id: string;
  email: string;
  role: UserRole;
}

export const generateTokens = async (user: GenerateTokensInterface) => {
  try {
    const payload = { _id: user._id, role: user.role, email: user.email };
    const access_token = jwt.sign(payload, ACCESS_TOKEN_PRIVATE_KEY, { expiresIn: '14m' });
    const refresh_token = jwt.sign(payload, REFRESH_TOKEN_PRIVATE_KEY, { expiresIn: '30d' });

    const userToken = await UserToken.findOne({ userId: user._id });

    if (userToken) await userToken.remove();

    await new UserToken({ userId: user._id, token: refresh_token }).save();
    return Promise.resolve({ access_token, refresh_token });
  } catch (err) {
    return Promise.reject(err);
  }
};