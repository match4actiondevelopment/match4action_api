import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import { createError } from "../utils/createError";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find().select("-password");

    return res
      .status(200)
      .json({ success: true, data: users, message: "User list found." });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(createError(403, "User not found."));
    }

    return res.status(200).json({ success: true, message: "User found." });
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req?.params?.id as string;

    const user = await User.findById(id);

    if (!user) {
      return next(createError(404, "User not found."));
    }

    if (req?.user?._id !== user?._id?.toString()) {
      return next(createError(403, "You can delete only your account."));
    }

    await User.findByIdAndDelete(id);

    return res.status(200).send({
      success: true,
      message: "User account removed!",
    });
  } catch (error) {
    next(error);
  }
};

export const profile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req?.user?._id);

    if (!user) {
      return next(createError(404, "User profile not found."));
    }

    user!.password = undefined;

    return res
      .status(200)
      .json({ success: true, data: user, message: "User profile found." });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(createError(404, "User not found."));
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

    const newUser = await User.findByIdAndUpdate(req.params.id, updateUser, {
      upsert: true,
      returnOriginal: false,
    });

    if (!newUser) {
      return next(createError(404, "User not updated."));
    }

    return res
      .status(200)
      .send({ success: true, data: newUser, message: "User updated." });
  } catch (error) {
    next(error);
  }
};
