import {
  NextFunction,
  Request,
  Response,
} from "express";
import {
  createApplication,
  listApplications,
} from "../services/applications";
import { createError } from "../utils/createError";

export async function apply(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?._id) {
      throw createError(
        401,
        "Authentication is required to apply."
      );
    }

    const data = await createApplication(
      String(req.user._id),
      req.params.id
    );

    return res.status(200).json({
      success: true,
      data,
      message: "Application submitted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyApplications(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?._id) {
      throw createError(
        401,
        "Authentication is required."
      );
    }

    const data = await listApplications(
      String(req.user._id)
    );

    res.setHeader(
      "Cache-Control",
      "private, no-store"
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}