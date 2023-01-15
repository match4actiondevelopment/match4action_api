import { NextFunction, Request, Response } from 'express';
import jwt, { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken';
import { UserRole } from '../models/User';
import { ACCESS_TOKEN_PRIVATE_KEY } from '../utils/constants';
import { RefreshTokenSuccessResponse } from '../utils/verifyRefreshToken';

export const authGuard = async (req: Request, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization;

  if (!bearer) {
    return res.status(404).json({ success: false, message: 'Bearer Token not provided!' });
  }

  const [, token] = bearer.split(' ');

  if (!token || token === undefined) {
    res.status(404).json({ success: false, message: 'Access Token not provided!' });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_PRIVATE_KEY, (err, tokenDetails) => {
      if (err instanceof TokenExpiredError) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized! Access Token was expired!',
        });
      }
      if (err instanceof NotBeforeError) {
        return res.status(401).json({
          success: false,
          message: 'Jwt not active,',
        });
      }
      if (err instanceof JsonWebTokenError) {
        return res.status(401).json({
          success: false,
          message: 'Jwt malformed.',
        });
      }

      if (tokenDetails)
        return {
          tokenDetails,
          success: true,
          message: 'Valid refresh token.',
        };
    }) as unknown as RefreshTokenSuccessResponse;

    if (decoded.success) {
      req.user = decoded.tokenDetails;
    }

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
  if (req?.user && req?.user?.role !== UserRole.admin) {
    res.status(401).json({ success: false, message: 'Unauthorized!' });
  } else {
    next();
  }
};
