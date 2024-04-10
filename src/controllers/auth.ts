import { NextFunction, Request, Response } from "express";
import jwt, {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from "jsonwebtoken";
import { uuid } from "uuidv4";
import { isLogged, signJwtAccessToken, signJwtRefreshToken } from "../middleware/jwt";
import { User, UserRole } from "../models/User";
import { UserToken } from "../models/UserToken";
import { hashPassword } from "../utils/bcrypt";
import { createError } from "../utils/createError";
import { CLIENT_BASE_URL } from "../utils/secrets";
import { LoginInput, LogoutInput, RegisterUserInput } from "../schemas/auth";
import { doLogin } from "../service/auth";

export const login = async (
  req: Request <{}, {}, LoginInput["body"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    
    const loginDone = await doLogin(req);

    if (loginDone.success == false){
      next(createError(404, "Login unsuccessfull"));
    }

    return res
      .cookie("access_token", loginDone.access_token, { httpOnly: true, domain: "localhost" })
      .cookie("refresh_token", loginDone.refresh_token, { httpOnly: true, domain: "localhost" })
      .status(200)
      .send({
        data: loginDone.data,
        success: true,
        message: "User logged successfully.",
      });
  } catch (error) {
    next(error);
  }
};

//TODO Move this code to service layer
export const register = async (
  req: Request <{}, {}, RegisterUserInput["body"]> ,
  res: Response,
  next: NextFunction
) => {
  try {
    
    const newPassword = await hashPassword(req.body?.password);

    const newUser = await User.create({
      name: req.body?.name,
      email: req.body?.email,
      password: newPassword,
      termsAndConditions: req.body?.termsAndConditions,
      provider: {
        id: req.body?.provider?.id ?? uuid(),
        name: req.body?.provider?.name,
      },
    });

    const access_token = signJwtAccessToken({
      _id: newUser?._id!,
      email: newUser?.email!,
      role: newUser?.role!,
    });

    const refresh_token = signJwtRefreshToken({
      _id: newUser?._id!,
      email: newUser?.email!,
      role: newUser?.role!,
    });

    const userToken = new UserToken({
      token: refresh_token,
      userId: newUser?._id,
    });

    const addedUserToken = await userToken.save();

    if (!addedUserToken) {
      return next(createError(404, "Error creating refresh token."));
    }

    newUser.password = undefined;

    return res
      .cookie("access_token", access_token, { httpOnly: true })
      .cookie("refresh_token", refresh_token, { httpOnly: true })
      .status(201)
      .send({
        data: newUser,
        success: true,
        message: "User created successfully.",
      });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request  <{}, {}, LogoutInput["body"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const access_token = req?.cookies?.access_token;
    const decoded_token = jwt.decode(access_token);

    if (typeof decoded_token == "object"){
      const id = decoded_token?._id;
      const result = await UserToken.deleteMany({ userId: id});      
      console.log("Logout result count: " + result.deletedCount);
    } else{
      return next(createError(500, "User not found."));
    }
    
    req.logOut((err) => {
      if (err) {
        return next(err);
      }
    });

    return res
      .clearCookie("access_token", { sameSite: "none", secure: true })
      .clearCookie("refresh_token", { sameSite: "none", secure: true })
      .status(200)
      .send({
        success: true,
        message: "User logout successfully.",
      });
  } catch (error) {
    next(error);
  }
};

// TODO Move this code to service layer
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req?.cookies?.refresh_token;
    
    console.log("Token: " + token) 

    const refreshToken = await UserToken.findOne({ token });

    console.log("achou Token? " + token) 

    if (!refreshToken) {
      return next(createError(404, "Refresh token is not in database."));
    }

    const user = await User.findById(refreshToken?.userId);

    if (!user) {
      return next(createError(404, "User not found."));
    }

    jwt.verify(
      refreshToken?.token,
      process.env.REFRESH_TOKEN_PRIVATE_KEY as string,
      async (err, _) => {
        if (err instanceof TokenExpiredError) {
          await UserToken.findByIdAndRemove(refreshToken?._id, {
            useFindAndModify: false,
          }).exec();
          return next(
            createError(403, "Unauthorized! Access Token was expired.")
          );
        }
        if (err instanceof NotBeforeError) {
          await UserToken.findByIdAndRemove(refreshToken?._id, {
            useFindAndModify: false,
          }).exec();
          return next(createError(403, "Jwt not active."));
        }
        if (err instanceof JsonWebTokenError) {
          await UserToken.findByIdAndRemove(refreshToken?._id, {
            useFindAndModify: false,
          }).exec();
          return next(createError(403, "Jwt malformed."));
        }
        next();
      }
    );

    const access_token = signJwtAccessToken({
      _id: user._id!,
      email: user.email!,
      role: user.role!,
    });

    return res
      .cookie("access_token", access_token, { httpOnly: true })
      .cookie("refresh_token", refreshToken?.token, { httpOnly: true })
      .status(201)
      .send({
        success: true,
        message: "Access token successfully refreshed.",
      });
  } catch (error) {
    next(error);
  }
};

export const google = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findOne({ email: req?.user?.email });

    if (!user) {
      return res.redirect(`${CLIENT_BASE_URL}/404`);
    }

    const access_token = signJwtAccessToken({
      _id: user?._id as string,
      email: user?.email as string,
      role: user?.role as UserRole,
    });

    const refresh_token = signJwtRefreshToken({
      _id: user?._id as string,
      email: user?.email as string,
      role: user?.role as UserRole,
    });

    const userToken = new UserToken({
      token: refresh_token,
      userId: user?._id,
    });

    const addedUserToken = await userToken.save();

    if (!addedUserToken) {
      return res.redirect(`${CLIENT_BASE_URL}/404`);
    }

    let url = new URL(CLIENT_BASE_URL);
    url.searchParams.set("access_token", access_token);
    url.searchParams.set("refresh_token", refresh_token);
    url.searchParams.set("user_id", user?._id);

    return res
      .cookie("access_token", access_token, {
        httpOnly: true,
      })
      .cookie("refresh_token", refresh_token, {
        httpOnly: true,
      })
      .redirect(url.toString());
  } catch (error) {
    return res.redirect(`${CLIENT_BASE_URL}/404`);
  }
};
