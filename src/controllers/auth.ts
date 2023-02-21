import { Request, Response } from 'express';
import jwt, { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken';
import { User, UserDocument } from '../models/User';
import { UserToken } from '../models/UserToken';
import { comparePasswords } from '../utils/bcrypt';
import { signJwtAccessToken, signJwtRefreshToken } from '../utils/jwt';

export class AuthController {
  async signUp(user: UserDocument): Promise<any> {
    try {
      const access_token = signJwtAccessToken({
        _id: user._id!,
        email: user.email!,
        role: user.role!
      })

      const refresh_token = signJwtRefreshToken({
        _id: user._id!,
        email: user.email!,
        role: user.role!
      });

      const userToken = new UserToken({
        token: refresh_token,
        userId: user?._id,
      });

      const addedUserToken = await userToken.save();

      if (!addedUserToken) {
        return { success: false, message: 'Error creating refresh token.' }
      }

      user.password = undefined;

      return {
        success: true,
        data: {
          access_token,
          refresh_token,
          user: user,
        },
      }
    } catch (error) {
      throw new Error(`Error: ${error}`);
    }
  }

  async signIn(req: Request, res: Response): Promise<void> {
    try {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        res.status(404).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const comparedPassword = await comparePasswords(req.body.password, user?.password!);

      if (!comparedPassword) {
        res.status(404).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const access_token = signJwtAccessToken({
        _id: user._id!,
        email: user.email!,
        role: user.role!
      })

      const refresh_token = signJwtRefreshToken({
        _id: user._id!,
        email: user.email!,
        role: user.role!
      });

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
          access_token,
          refresh_token,
          user
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

      const result = jwt.verify(
        refreshToken?.token,
        process.env.REFRESH_TOKEN_PRIVATE_KEY as string,
        (err, tokenDetails) => {

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
        }
      ) as unknown as any;


      if (!result?.success) {
        await UserToken.findByIdAndRemove(refreshToken?._id, { useFindAndModify: false }).exec();

        res.status(403).json({
          message: 'Refresh token was expired. Please make a new sign-in request.',
          result,
        });
        return;
      }

      const user = await User.findById(refreshToken?.userId);

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const access_token = signJwtAccessToken({
        _id: user._id!,
        email: user.email!,
        role: user.role!
      })

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

  async googleSignIn(email?: string) {
    try {
      if (!email) {
        throw new Error('Email must be provided.');
      }

      const user = await User.findOne({ email });

      if (!user) {
        throw new Error('Invalid email or password.');
      }

      const access_token = signJwtAccessToken({
        _id: user._id!,
        email: user.email!,
        role: user.role!
      })

      const refresh_token = signJwtRefreshToken({
        _id: user._id!,
        email: user.email!,
        role: user.role!
      });

      const userToken = new UserToken({
        token: refresh_token,
        userId: user?._id,
      });

      const addedUserToken = await userToken.save();

      if (!addedUserToken) {
        throw new Error('Error creating refresh token.');
      }

      return {
        success: true,
        data: {
          access_token,
          refresh_token,
          userId: user?._id,
        },
      };
    } catch (error) {
      throw new Error(`Error: ${error}`);
    }
  };

}
