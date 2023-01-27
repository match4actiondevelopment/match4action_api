import { Request, Response } from 'express';
import jwt, { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken';
import { comparePasswords, hashPassword } from '../middlewares/bcrypt';
import { User } from '../models/User';
import { UserToken } from '../models/UserToken';
import {
  ACCESS_TOKEN_PRIVATE_KEY,
  ACCESS_TOKEN_PRIVATE_TIME,
  REFRESH_TOKEN_PRIVATE_KEY,
  REFRESH_TOKEN_PRIVATE_TIME,
} from '../utils/constants';

export class AuthController {
  async signUp(req: Request, res: Response): Promise<any> {
    try {
      if (!req?.body?.termsAndConditions) {
        res
          .status(404)
          .json({ success: false, message: 'Error creating new user. The user must agree with terms and conditions.' });
        return;
      }

      const user = await User.findOne({ email: req.body.email });

      if (user) {
        res.status(404).json({ success: false, message: 'Invalid email.' });
        return;
      }

      const newPassword = await hashPassword(req?.body?.password);

      const newUser = new User({
        name: req?.body?.name,
        email: req?.body?.email,
        termsAndConditions: req?.body?.termsAndConditions,
        role: req?.body?.role ?? 'volunteer',
        password: newPassword,
        provider: req?.body?.provider ?? 'credentials',
      });

      const addedUser = await newUser.save();

      const createdUser = await User.findById(addedUser._id);

      if (!createdUser) {
        res.status(404).json({ success: false, message: 'Error creating new user.' });
        return;
      }

      const access_token = jwt.sign(
        {
          _id: createdUser!._id,
          role: createdUser!.role,
          email: createdUser!.email,
        },
        ACCESS_TOKEN_PRIVATE_KEY,
        { expiresIn: +ACCESS_TOKEN_PRIVATE_TIME }
      );

      const refresh_token = jwt.sign(
        {
          _id: createdUser!._id,
          role: createdUser!.role,
          email: createdUser!.email,
        },
        REFRESH_TOKEN_PRIVATE_KEY,
        { expiresIn: REFRESH_TOKEN_PRIVATE_TIME }
      );

      const userToken = new UserToken({
        token: refresh_token,
        userId: createdUser?._id,
      });

      const addedUserToken = await userToken.save();

      if (!addedUserToken) {
        res.status(404).json({ success: false, message: 'Error creating refresh token.' });
        return;
      }

      if (createdUser) {
        createdUser.password = undefined;
      }

      res.status(201).json({
        success: true,
        user: {
          ...createdUser?.toObject(),
          access_token,
          refresh_token,
        },
      });
    } catch (error) {
      res.status(404);
    }
  }

  async signIn(req: Request, res: Response): Promise<void> {
    try {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        res.status(404).json({ success: false, message: 'Invalid email or password.' });
      }

      const newPassword = await comparePasswords(req.body.password, user?.password!);

      if (!newPassword) {
        res.status(404).json({ success: false, message: 'Invalid email or password.' });
      }

      const access_token = jwt.sign(
        {
          _id: user!._id,
          role: user!.role,
          email: user!.email,
        },
        ACCESS_TOKEN_PRIVATE_KEY,
        { expiresIn: +ACCESS_TOKEN_PRIVATE_TIME }
      );

      const refresh_token = jwt.sign(
        {
          _id: user!._id,
          role: user!.role,
          email: user!.email,
        },
        REFRESH_TOKEN_PRIVATE_KEY,
        { expiresIn: REFRESH_TOKEN_PRIVATE_TIME }
      );

      const userToken = new UserToken({
        token: refresh_token,
        userId: user?._id,
      });

      const addedUserToken = await userToken.save();

      if (!addedUserToken) {
        res.status(404).json({ success: false, message: 'Error creating refresh token.' });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          ...user?.toObject(),
          access_token,
          refresh_token,
        },
      });
    } catch (error) {
      res.status(404);
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      if (!req?.body?.refresh_token) {
        res.status(400).json({ success: false, message: 'Error: refresh token is required!' });
        return;
      }

      const refreshToken = await UserToken.findOne({ token: req?.body?.refresh_token });

      if (!refreshToken) {
        res.status(403).json({ message: 'Refresh token is not in database!' });
        return;
      }

      const result = jwt.verify(refreshToken?.token, REFRESH_TOKEN_PRIVATE_KEY, (err, tokenDetails) => {
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
      }) as unknown as any;

      if (!result?.success) {
        UserToken.findByIdAndRemove(refreshToken?._id, { useFindAndModify: false }).exec();

        res.status(403).json({
          message: 'Refresh token was expired. Please make a new sign-in request',
          result,
        });
        return;
      }

      const user = await User.findById(refreshToken?.userId);

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const access_token = jwt.sign(
        {
          _id: user!._id,
          role: user!.role,
          email: user!.email,
        },
        ACCESS_TOKEN_PRIVATE_KEY,
        { expiresIn: +ACCESS_TOKEN_PRIVATE_TIME }
      );

      res.status(200).json({
        success: true,
        data: {
          access_token,
          refresh_token: refreshToken.token,
        },
      });
    } catch (error) {
      res.status(404);
    }
  }

  async googleSignIn(req: Request, res: Response): Promise<void> {
    try {
      const user = await User.findOne({ email: req?.body?.email });

      if (!user) {
        res.status(404).json({ success: false, message: 'Invalid email or password.' });
      }

      const access_token = jwt.sign(
        {
          _id: user!._id,
          role: user!.role,
          email: user!.email,
        },
        ACCESS_TOKEN_PRIVATE_KEY,
        { expiresIn: +ACCESS_TOKEN_PRIVATE_TIME }
      );

      const refresh_token = jwt.sign(
        {
          _id: user!._id,
          role: user!.role,
          email: user!.email,
        },
        REFRESH_TOKEN_PRIVATE_KEY,
        { expiresIn: REFRESH_TOKEN_PRIVATE_TIME }
      );

      const userToken = new UserToken({
        token: refresh_token,
        userId: user?._id,
      });

      const addedUserToken = await userToken.save();

      if (!addedUserToken) {
        res.status(404).json({ success: false, message: 'Error creating refresh token.' });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          ...user?.toObject(),
          access_token,
          refresh_token,
        },
      });
    } catch (error) {
      res.status(404);
    }
  }
}
