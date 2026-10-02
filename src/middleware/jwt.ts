import { NextFunction, Request, Response } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import {
  User,
  UserDocument,
  UserRole,
} from "../models/User";
import { createError } from "../utils/createError";

export interface SignJwtInterface {
  _id: string;
  role: UserRole;
  email: string;
}

export const signJwtAccessToken = (
  data: SignJwtInterface
) =>
  jwt.sign(
    {
      _id: data._id,
      role: data.role,
      email: data.email,
    },
    process.env.ACCESS_TOKEN_PRIVATE_KEY as string,
    {
      expiresIn:
        process.env.ACCESS_TOKEN_PRIVATE_TIME || "15m",
    } as any
  );

export const signJwtRefreshToken = (
  data: SignJwtInterface
) =>
  jwt.sign(
    {
      _id: data._id,
      role: data.role,
      email: data.email,
    },
    process.env.REFRESH_TOKEN_PRIVATE_KEY as string,
    {
      expiresIn:
        process.env.REFRESH_TOKEN_PRIVATE_TIME || "7d",
    } as any
  );

const authenticate = (
  roles?: (keyof typeof UserRole)[]
) =>
  async (
    req: Request,
    _res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.cookies?.access_token;

      if (typeof token !== "string" || !token) {
        return next(
          createError(401, "Access Token not provided.")
        );
      }

      const secret =
        process.env.ACCESS_TOKEN_PRIVATE_KEY;

      if (!secret) {
        return next(
          createError(
            500,
            "Authentication is not configured."
          )
        );
      }

      let payload;

      try {
        payload = jwt.verify(token, secret, {
          algorithms: ["HS256"],
        });
      } catch (error) {
        return next(
          createError(
            403,
            error instanceof TokenExpiredError
              ? "Unauthorized! Access Token was expired."
              : "Invalid access token."
          )
        );
      }

      if (
        typeof payload === "string" ||
        typeof payload._id !== "string" ||
        !/^[a-f\d]{24}$/i.test(payload._id)
      ) {
        return next(
          createError(401, "Invalid account identity.")
        );
      }

      // The token proves identity.
      // MongoDB determines the account's current permissions.
      const user = await User.findById(payload._id)
        .select("role email")
        .lean();

      if (!user) {
        return next(
          createError(401, "Account no longer exists.")
        );
      }

      if (
        !Object.values(UserRole).includes(
          user.role as UserRole
        )
      ) {
        return next(
          createError(
            403,
            "Account role requires administrator review."
          )
        );
      }

      if (
        roles &&
        !roles.includes(
          user.role as keyof typeof UserRole
        )
      ) {
        return next(
          createError(
            403,
            "Forbidden: insufficient permissions."
          )
        );
      }

      req.user = {
        _id: String(user._id),
        role: user.role,
        email: user.email,
      } as UserDocument;

      return next();
    } catch (error) {
      return next(error);
    }
  };

export const isLogged = authenticate();

export const hasRoles = (
  roles: (keyof typeof UserRole)[]
) => authenticate(roles);

export const isAdmin = hasRoles(["admin"]);