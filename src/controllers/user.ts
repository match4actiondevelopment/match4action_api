import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { comparePasswords, hashPassword } from '../middlewares/bcrypt';
import { generateToken, TokenData } from '../middlewares/jwt';
import { User, UserInterface } from '../models/User';

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
      const userLogged = req.user as TokenData;
      const user = await User.findById(req.params.id).select('-password');

      if (userLogged?.id !== user?._id.toString()) {
        res.status(401).json({ success: false, message: 'Unauthorized! Access Token invalid!' });
      }
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(404);
    }
  }

  async update(req: Request, res: Response): Promise<UserInterface[] | any> {
    try {
      const userLogged = req.user as TokenData;
      const user = await User.findById(req.params.id);

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
      }

      if (userLogged?.id !== user?._id.toString()) {
        res.status(401).json({ success: false, message: 'Unauthorized! Access Token invalid!' });
      }

      user!.bio = req.body.bio ?? user!.bio;
      user!.password = req.body.password ?? user!.password;
      user!.photo = req.body.photo ?? user!.photo;
      user!.location = req.body.location ?? user!.location;

      const newUser = await User.findByIdAndUpdate(req.params.id, user!, { upsert: true, returnOriginal: false });

      if (!newUser) {
        res.status(401).json({ success: false, message: 'User not updated.' });
      }

      res.status(200).json({ success: true, data: newUser });
    } catch (error) {
      res.status(404);
    }
  }

  async delete(req: Request, res: Response): Promise<UserInterface[] | any> {
    try {
      const userLogged = req.user as TokenData;
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

  async signUp(req: Request, res: Response): Promise<UserInterface[] | any> {
    try {
      const user = await User.findOne({ email: req.body.email });

      if (user) {
        res.status(404).json({ success: false, message: 'Invalid email.' });
      }

      const newPassword = await hashPassword(req.body.password);

      const newUser = await User.create({
        ...req.body,
        password: newPassword,
      });

      const createdUser = await User.findById(newUser.id).select('-password');

      if (!createdUser) {
        res.status(404).json({ success: false, message: 'Error creating new user.' });
      }

      const token = generateToken(newUser);

      res.status(200).json({ success: true, data: createdUser, token });
    } catch (error) {
      res.status(404);
    }
  }

  async signIn(req: Request, res: Response): Promise<UserInterface[] | any> {
    try {
      const user = (await User.findOne({ email: req.body.email })) as UserInterface;

      if (!user) {
        res.status(404).json({ success: false, message: 'Invalid email or password.' });
      }

      const newPassword = await comparePasswords(req.body.password, user?.password!);

      if (!newPassword) {
        res.status(404).json({ success: false, message: 'Invalid email or password.' });
      }

      const token = generateToken(user);

      user.password = undefined;

      res.status(200).json({ success: true, data: user, token });
    } catch (error) {
      res.status(404);
    }
  }
}
