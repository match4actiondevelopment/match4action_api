import { NextFunction, Request, Response } from "express";
import { uploadBusiness } from "../business/upload";
import { User } from "../models/User";
import { createError } from "../utils/createError";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req?.file) {
      return next(createError(404, "File not found."));
    }

    const user = await User.findById(req?.body?.id);

    if (!user) {
      return next(createError(404, "User not found."));
    }

    if (req?.user?._id !== user?._id?.toString()) {
      return next(createError(403, "You can delete only your initiatives."));
    }

    const uploadResponse = await uploadBusiness({
      file: req?.file,
      folderName: req?.body?.folderName,
    });

    if (!uploadResponse?.success) {
      return next(createError(404, "Error uploading image."));
    }

    return res.status(201).json({
      success: true,
      data: uploadResponse?.url,
      message: "Uploaded image successfully.",
    });
  } catch (error) {
    next(error);
  }
};
