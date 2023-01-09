import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../models/User';
import { verifyRefreshToken, VerifyRefreshTokenSuccessResponse } from '../utils/verifyRefreshToken';

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
    const decoded = (await verifyRefreshToken(token)) as VerifyRefreshTokenSuccessResponse;

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
