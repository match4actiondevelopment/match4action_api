import { Request, Response } from 'express';
import mongoose, { isValidObjectId } from 'mongoose';
import { User, UserDocument } from '../models/User';

export class UserController {
  async getAll(req: Request, res: Response): Promise<UserDocument[] | any> {
    try {
      const users = await User.find().select('-password');

      res.status(200).json({ data: users });
    } catch (error) {
      res.status(404);
    }
  }

  async getOne(req: Request, res: Response): Promise<UserDocument[] | any> {
    try {
      if (!isValidObjectId(req.params.id)) {
        res.status(404).json({ success: false, message: 'Invalid id!' });
      }

      const user = await User.findById(req.params.id);

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found!' });
      }

      if (user) {
        res.status(200).json({ success: true, message: 'User found!' });
      }
    } catch (error) {
      res.status(404);
    }
  }

  async profile(req: Request, res: Response): Promise<UserDocument[] | any> {
    try {
      if (!isValidObjectId(req.body.id)) {
        res.status(404).json({ success: false, message: 'Invalid id!' });
      }

      const user = await User.findById(req?.user?._id);

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found!' });
      }

      if (user && req.user?._id !== user?._id.toString()) {
        res.status(404).json({ success: false, message: 'User not found!' });
      }

      user!.password = undefined;

      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(404);
    }
  }

  async update(req: Request, res: Response): Promise<UserDocument[] | any> {
    try {
      const userLogged = req.user;
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      if (userLogged?._id?.toString() !== user?._id?.toString()) {
        return res.status(401).json({ success: false, message: 'Unauthorized! Access Token invalid!' });
      }

      const updateUser = new User(user);

      updateUser.bio = req?.body?.bio ?? user?.bio;
      updateUser.location = req?.body?.location ?? user?.location;
      updateUser.role = req?.body?.role ?? user?.role;
      updateUser.birthDate = req?.body?.birthDate ?? user?.birthDate;
      updateUser.name = req?.body?.name ?? user?.name;
      updateUser.image = req?.body?.image ?? user?.image;

      // updateUser.password = req?.body?.password ?? user?.password;
      // updateUser.answers = req?.body?.answers ?? user?.answers;

      const newUser = await User.findByIdAndUpdate(req.params.id, updateUser, { upsert: true, returnOriginal: false });

      if (!newUser) {
        return res.status(404).json({ success: false, message: 'User not updated.' });
      }

      res.status(200).json({ success: true, data: newUser });
    } catch (error) {
      res.status(404);
    }
  }

  async delete(req: Request, res: Response): Promise<UserDocument[] | any> {
    try {
      const userLogged = req.user;
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
}
