import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { comparePasswords, hashPassword } from '../middlewares/bcrypt';
import { User } from '../models/User';
import { ACCESS_TOKEN_PRIVATE_KEY } from '../utils/constants';
import { generateTokens } from '../utils/generateToken';
import { verifyRefreshToken } from '../utils/verifyRefreshToken';

export class AuthController {
  async signUp(req: Request, res: Response): Promise<void> {
    try {
      if (!req?.body?.termsAndConditions) {
        res
          .status(404)
          .json({ success: false, message: 'Error creating new user. The user must agree with terms and conditions.' });
      }

      const user = await User.findOne({ email: req.body.email });

      if (user) {
        res.status(404).json({ success: false, message: 'Invalid email.' });
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
      }

      const { access_token, refresh_token } = await generateTokens({
        _id: String(createdUser?._id),
        email: createdUser?.email!,
        role: createdUser?.role!,
      });

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

      const { access_token, refresh_token } = await generateTokens({
        _id: String(user?._id),
        email: user?.email!,
        role: user?.role!,
      });

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
      const refreshTokenResponse = (await verifyRefreshToken(req.body.refresh_token)) as any;

      if (!refreshTokenResponse) {
        res.status(400).json({ success: false, message: 'Error.' });
      }

      const payload = {
        _id: refreshTokenResponse._id,
        email: refreshTokenResponse.email,
        role: refreshTokenResponse.role,
      };

      const access_token = jwt.sign(payload, ACCESS_TOKEN_PRIVATE_KEY, { expiresIn: '5m' });

      res.status(200).json({
        success: true,
        data: {
          access_token,
        },
      });
    } catch (error) {
      res.status(404);
    }
  }
}
