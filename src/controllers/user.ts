import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose, { isValidObjectId } from 'mongoose';
import { comparePasswords, hashPassword } from '../middlewares/bcrypt';
import { User, UserInterface } from '../models/User';
import { ACCESS_TOKEN_PRIVATE_KEY } from '../utils/constants';
import { generateTokens } from '../utils/generateToken';
import { verifyRefreshToken } from '../utils/verifyRefreshToken';

export class UserController {
  async getAll(req: Request, res: Response): Promise<UserInterface[] | any> {
    try {
      const users = await User.find().select('-password');

      res.status(200).json({ data: users });
    } catch (error) {
      res.status(404);
    }
  }

  async getOne(req: Request, res: Response): Promise<UserInterface[] | any> {
    try {
      if (!isValidObjectId(req.params.id)) {
        res.status(404).json({ success: false, message: 'Invalid id!' });
      }

      const user = await User.findById(req.params.id);

      if (!user) {
        res.status(200).json({ success: false, message: 'User not found!' });
      }

      if (user) {
        res.status(200).json({ success: true, message: 'User found!' });
      }
    } catch (error) {
      res.status(404);
    }
  }

  async profile(req: Request, res: Response): Promise<UserInterface[] | any> {
    try {
      if (!isValidObjectId(req.body.id)) {
        res.status(404).json({ success: false, message: 'Invalid id!' });
      }

      const userLogged = req.user as any;
      const user = await User.findById(req.body.id);

      if (!user) {
        res.status(200).json({ success: false, message: 'User not found!' });
      }

      if (user && userLogged?.id === user?._id.toString()) {
        res.status(200).json({ success: true, data: user });
      }
    } catch (error) {
      res.status(404);
    }
  }

  async update(req: Request, res: Response): Promise<UserInterface[] | any> {
    try {
      const userLogged = req.user as any;
      const user = await User.findById(req.params.id);

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
      }

      if (userLogged?.id !== user?._id.toString()) {
        res.status(401).json({ success: false, message: 'Unauthorized! Access Token invalid!' });
      }

      const updateUser = new User(user);

      updateUser.bio = req?.body?.bio ?? user?.bio;
      updateUser.password = req?.body?.password ?? user?.password;
      updateUser.image = req?.body?.image ?? user?.image;
      updateUser.location = req?.body?.location ?? user?.location;
      updateUser.role = req?.body?.role ?? user?.role;
      updateUser.birthDate = req?.body?.birthDate ?? user?.birthDate;
      updateUser.questions = req?.body?.questions ?? user?.questions;

      const newUser = await User.findByIdAndUpdate(req.params.id, updateUser, { upsert: true, returnOriginal: false });

      if (!newUser) {
        res.status(404).json({ success: false, message: 'User not updated.' });
      }

      res.status(200).json({ success: true, data: newUser });
    } catch (error) {
      res.status(404);
    }
  }

  async delete(req: Request, res: Response): Promise<UserInterface[] | any> {
    try {
      const userLogged = req.user as any;
      const user = await User.findById(req.params.id);

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
      }

      if (userLogged?.id !== user?._id.toString()) {
        res.status(401).json({ success: false, message: 'Unauthorized! Access Token invalid!' });
      }

      const objectId = new mongoose.Types.ObjectId(req.params.id);
      const deletedGoal = await User.findOneAndDelete(objectId);

      res.status(200).json({ success: !!deletedGoal });
    } catch (error) {
      res.status(404);
    }
  }

  async signUp(req: Request, res: Response): Promise<void> {
    try {
      const user = await User.findOne({ email: req.body.email });

      if (user) {
        res.status(404).json({ success: false, message: 'Invalid email.' });
      }

      const newPassword = await hashPassword(req?.body?.password);

      const newUser = new User({
        name: req?.body?.name,
        email: req?.body?.email,
        role: req?.body?.role ?? 'volunteer',
        password: newPassword,
        location: {
          country: req?.body?.country,
          city: req?.body?.city,
        },
        birthDate: req?.body?.birthDate,
        questions: {},
        bio: '',
        image: '',
      });

      const addedUser = await newUser.save();

      const createdUser = await User.findById(addedUser._id).select('-password');

      if (!createdUser) {
        res.status(404).json({ success: false, message: 'Error creating new user.' });
      }

      const { access_token, refresh_token } = await generateTokens({
        _id: String(createdUser?._id),
        email: createdUser?.email!,
        role: createdUser?.role!,
      });

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

      const access_token = jwt.sign(payload, ACCESS_TOKEN_PRIVATE_KEY, { expiresIn: '14m' });

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
