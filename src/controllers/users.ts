import { NextFunction, Request, Response } from "express";
import { User, UserRole } from "../models/User";
import { createError } from "../utils/createError";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find().select("-password");

    return res.status(200).json({
      success: true,
      data: users,
      message: "User list found.",
    });
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
      return next(createError(404, "User not found."));
    }

    return res.status(200).json({
      success: true,
      message: "User found.",
    });
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
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return next(createError(404, "User not found."));
    }

    if (req.user?._id !== user._id.toString()) {
      return next(
        createError(
          403,
          "You can delete only your account."
        )
      );
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
    const user = await User.findById(
      req.user?._id
    ).select("-password");

    res.setHeader(
      "Cache-Control",
      "private, no-store"
    );

    if (!user) {
      return next(
        createError(404, "User profile not found.")
      );
    }

    user.password = undefined;

    return res.status(200).json({
      success: true,
      data: user,
      message: "User profile found.",
    });
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
    if (String(req.user?._id) !== req.params.id) {
      return next(
        createError(
          403,
          "You can update only your account."
        )
      );
    }

    const user = await User.findById(
      req.params.id
    ).select("role");

    if (!user) {
      return next(createError(404, "User not found."));
    }

    const body = req.body;

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return next(
        createError(400, "Invalid profile update.")
      );
    }

    // Older clients submit their unchanged role.
    // Accept that without writing it.
    // Actual role changes must use /users/role.
    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "role"
      ) &&
      body.role !== user.role
    ) {
      return next(
        createError(
          403,
          "Use role selection to change your account role."
        )
      );
    }

    const changes: Record<string, unknown> = {};

    for (const field of [
      "name",
      "bio",
      "image",
      "birthDate",
      "location",
    ]) {
      if (body[field] !== undefined) {
        changes[field] = body[field];
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: changes },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updated) {
      return next(createError(404, "User not found."));
    }

    res.setHeader(
      "Cache-Control",
      "private, no-store"
    );

    return res.json({
      success: true,
      data: updated,
      message: "User updated.",
    });
  } catch (error) {
    next(error);
  }
};

export const selectRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const role = req.body?.role;

    if (
      role !== UserRole.volunteer &&
      role !== UserRole.organization
    ) {
      return next(
        createError(
          400,
          "Choose volunteer or organization."
        )
      );
    }

    // Use authenticated identity, never a submitted user ID.
    // The role condition also prevents overwriting a
    // concurrent administrator promotion.
    const user = await User.findOneAndUpdate(
      {
        _id: req.user?._id,
        role: {
          $in: [
            UserRole.volunteer,
            UserRole.organization,
          ],
        },
      },
      {
        $set: { role },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return next(
        createError(
          403,
          "This account cannot change its role here."
        )
      );
    }

    // Existing tokens remain usable because authorization
    // reads the current role from MongoDB.
    res.setHeader(
      "Cache-Control",
      "private, no-store"
    );

    return res.json({
      success: true,
      data: user,
      message: "Account role saved.",
    });
  } catch (error) {
    next(error);
  }
};