import jwt from 'jsonwebtoken';
import { IUser } from '../models/user';

export const createJWT = (user: IUser) => {
  const token = jwt.sign(
    {
      id: user.id,
      username: user.firstName,
    },
    process.env.JWT_SECRET as string
  );

  return token;
};
