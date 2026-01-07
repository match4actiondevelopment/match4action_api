import { NextFunction, Request, Response } from "express";
import jwt, {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from "jsonwebtoken";
import { UserRole } from "../models/User";
import { createError } from "../utils/createError";

export interface SignJwtInterface {
  _id: string;
  role: UserRole;
  email: string;
}

export const signJwtAccessToken = (data: SignJwtInterface) => {
  return jwt.sign(
    {
      _id: data?._id,
      role: data?.role,
      email: data?.email,
    },
    process.env.ACCESS_TOKEN_PRIVATE_KEY as string,
    { expiresIn: process.env.ACCESS_TOKEN_PRIVATE_TIME || "15m" } as any
  );
};

export const signJwtRefreshToken = (data: SignJwtInterface) => {
  return jwt.sign(
    {
      _id: data?._id,
      role: data?.role,
      email: data?.email,
    },
    process.env.REFRESH_TOKEN_PRIVATE_KEY as string,
    { expiresIn: process.env.REFRESH_TOKEN_PRIVATE_TIME || "7d" } as any
  );
};

export const isLogged = (req: Request, res: Response, next: NextFunction) => {
  const token = req?.cookies?.access_token;

  if (!token || token === undefined) {
    return next(createError(401, "Access Token not provided."));
  }

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_PRIVATE_KEY as string,
    async (err: any, payload: any) => {
      if (err instanceof TokenExpiredError) {
        return next(
          createError(403, "Unauthorized! Access Token was expired.")
        );
      }

      if (err instanceof NotBeforeError) {
        return next(createError(403, "Jwt not active."));
      }

      if (err instanceof JsonWebTokenError) {
        return next(createError(403, "Jwt malformed."));
      }
      req.user = payload;
      next();
    }
  );
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = req?.cookies?.access_token;

  if (!token || token === undefined) {
    return next(createError(401, "Access Token not provided."));
  }

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_PRIVATE_KEY as string,
    async (err: any, payload: any) => {
      if (err instanceof TokenExpiredError) {
        return next(
          createError(403, "Unauthorized! Access Token was expired.")
        );
      }

      if (err instanceof NotBeforeError) {
        return next(createError(403, "Jwt not active."));
      }

      if (err instanceof JsonWebTokenError) {
        return next(createError(403, "Jwt malformed."));
      }

      if (req.user?.role !== UserRole?.admin) {
        return next(createError(403, "Unauthorized."));
      }

      req.user = payload;
      next();
    }
  );
};
