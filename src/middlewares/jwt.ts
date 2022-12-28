import { NextFunction, Request, Response } from 'express';
import jwt, { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken';
import { UserInterface } from '../models/User';

const jwtSecret: string = process.env.JWT_SECRET ?? 'asddd3232sa123';

export const generateToken = (data?: Express.User) => {
  const token = jwt.sign(
    {
      id: (data as any)._id,
      role: (data as any).role,
      name: (data as any).name,
    },
    jwtSecret,
    { expiresIn: process.env.TOKEN_LIFE }
  );
  return token;
};

export interface TokenData {
  id: string;
  role: string;
  name: string;
  iat: number;
  exp: number;
}

export const authGuard = (req: Request, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization;

  if (!bearer) {
    return res.status(404).json({ success: false, message: 'Bearer Token not provided!' });
  }

  const [, token] = bearer.split(' ');

  if (!token || token === undefined) {
    res.status(404).json({ success: false, message: 'Access Token not provided!' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err instanceof TokenExpiredError) {
        return res.status(401).send({
          success: false,
          message: 'Unauthorized! Access Token was expired!',
        });
      }
      if (err instanceof NotBeforeError) {
        return res.status(401).send({
          success: false,
          message: 'Jwt not active,',
        });
      }
      if (err instanceof JsonWebTokenError) {
        return res.status(401).send({
          success: false,
          message: 'Jwt malformed.',
        });
      }
      return decoded;
    });

    req.user = decoded as unknown as TokenData;

    next();
  } catch (e) {
    console.error(e);
    return res.status(401).json({
      success: false,
      message: 'Not authorized.',
    });
  }
};

export const adminGuard = (req: Request, res: Response, next: NextFunction) => {
  const user = req?.user as UserInterface;

  if (req?.user && user?.role !== 'user') {
    res.status(401).json({ success: false, message: 'Unauthorized!' });
  } else {
    next();
  }
};
