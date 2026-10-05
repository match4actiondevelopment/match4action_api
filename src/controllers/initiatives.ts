import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { uploadBusiness } from "../service/upload";
import { Initiative } from "../models/Initiatives";
import { createError } from "../utils/createError";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const literal = (value: unknown) =>
      typeof value === "string"
        ? value.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        : "";
    const conditions: any[] = [];
    for (const key of ["country", "city"] as const) {
      const value = literal(req.query[key]);
      if (value)
        conditions.push({
          [`location.${key}`]: { $regex: value, $options: "i" },
        });
    }
    const location = literal(req.query.location);
    if (location && !req.query.country && !req.query.city)
      conditions.push({
        $or: [
          { "location.city": { $regex: location, $options: "i" } },
          { "location.country": { $regex: location, $options: "i" } },
        ],
      });
    const search = literal(req.query.search || req.query.q);
    if (search)
      conditions.push({
        $or: [
          "initiativeName",
          "description",
          "servicesNeeded",
          "whatMovesThisInitiative",
          "whichAreasAreCoveredByThisInitiative",
        ].map((field) => ({ [field]: { $regex: search, $options: "i" } })),
      });
    const filter = conditions.length ? { $and: conditions } : {};

    const initiatives = await Initiative.find(filter);

    return res.status(200).send({
      data: initiatives,
      success: true,
      message: "Initiatives list successfully found.",
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
    const initiative = await Initiative.findById(req?.params?.id)
      .populate("goals", "name image")
      .populate("userId", "name");

    if (!initiative) {
      return next(createError(404, "Initiative not found."));
    }

    return res.status(200).send({
      data: initiative,
      success: true,
      message: "Initiative successfully found.",
    });
  } catch (error) {
    next(error);
  }
};

export const getInitiativesByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = new mongoose.Types.ObjectId(req?.user?._id);

    const initiatives = await Initiative.find({
      applicants: userId,
    })
      .populate("goals", "name image")
      .populate("userId", "name");

    if (!initiatives) {
      return next(createError(404, "User initiatives not found."));
    }

    return res.status(200).send({
      data: initiatives,
      success: true,
      message: "User initiatives successfully found.",
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id)
      return next(createError(401, "Authentication required."));
    const body = req.body;
    const parse = (value: unknown, fallback: unknown) => {
      if (value === undefined || value === "") return fallback;
      if (typeof value !== "string") return value;
      try {
        return JSON.parse(value);
      } catch {
        throw createError(400, "Invalid initiative form data.");
      }
    };
    const list = (value: unknown): string[] => {
      const result = parse(value, []);
      if (
        !Array.isArray(result) ||
        result.some((item) => typeof item !== "string")
      ) {
        throw createError(
          400,
          "Initiative tags and goals must be lists of text values."
        );
      }
      return result;
    };
    const location = parse(body.location, {}) as {
      country?: string;
      city?: string;
    };
    if (
      !location ||
      typeof location !== "object" ||
      Array.isArray(location) ||
      (location.city !== undefined && typeof location.city !== "string") ||
      (location.country !== undefined && typeof location.country !== "string")
    ) {
      return next(createError(400, "Invalid location."));
    }
    const date = (value: string | undefined, day?: string) => {
      if (!value) return undefined;
      const parsed = new Date(
        /^\d{2}:\d{2}$/.test(value) && day ? `${day}T${value}:00Z` : value
      );
      if (!Number.isFinite(parsed.getTime()))
        throw createError(400, "Invalid event date or time.");
      return parsed;
    };
    const initiative = new Initiative({
      initiativeName: body.initiativeName,
      description: body.description,
      userId: req.user._id,
      status: "active",
      applicants: [],
      eventItemFrame: body.eventItemFrame || body.eventTimeFrame,
      eventItemType: body.eventItemType || body.eventType,
      whatMovesThisInitiative: list(body.whatMovesThisInitiative),
      whichAreasAreCoveredByThisInitiative: list(
        body.whichAreasAreCoveredByThisInitiative
      ),
      servicesNeeded: list(body.servicesNeeded),
      goals: list(body.goals),
      location: { country: location.country, city: location.city },
      startDate: date(body.startDate),
      endDate: date(body.endDate),
      startTime: date(body.startTime, body.startDate),
      endTime: date(body.endTime, body.endDate),
      postalCode: body.postalCode,
      website: body.website,
      image: [],
    });
    const validation = initiative.validateSync();
    if (validation)
      return next(
        createError(400, "Check the required initiative fields and dates.")
      );
    if (req.file) {
      const uploaded = await uploadBusiness({
        file: req.file,
        folderName: body.folderName,
      });
      if (!uploaded?.success)
        return next(createError(502, "Error uploading image."));
      initiative.image = uploaded.url ? [uploaded.url] : [];
    }

    const { _id } = await initiative.save();

    const createdInitiative = await Initiative.findById(_id);

    if (!createdInitiative) {
      return next(createError(404, "Initiative not created."));
    }

    return res.status(201).send({
      data: createdInitiative,
      success: true,
      message: "Initiative successfully created.",
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
    const objectId = new mongoose.Types.ObjectId(req.params.id);

    const initiative = await Initiative.findById(objectId);

    if (!initiative) {
      return next(createError(404, "Initiative not found."));
    }

    if (req?.user?._id !== initiative?.userId?.toString()) {
      return next(createError(403, "You can delete only your initiatives."));
    }

    const deletedInitiative = await Initiative.findOneAndDelete(objectId);

    return res.status(200).json({
      success: !!deletedInitiative,
      message: "Initiative successfully removed",
    });
  } catch (error) {
    next(error);
  }
};

// Keep the existing exported Apply controller name.
// Application persistence now lives in its own controller/service.
export { apply } from "./applications";

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = new mongoose.Types.ObjectId(req?.params?.id);

    const initiative = await Initiative.findById(id);

    if (req?.user?._id !== initiative?.userId?.toString()) {
      return next(createError(403, "You can update only your initiatives."));
    }

    const endTime = new Date();

    const [endTimeHour, endTimeMinutes] = req?.body?.endTime?.split(":");

    endTime.setHours(endTimeHour);
    endTime.setMinutes(endTimeMinutes);

    const startTime = new Date();

    const [startTimeHour, startTimeMinutes] = req?.body?.startTime?.split(":");

    startTime.setHours(startTimeHour);
    startTime.setMinutes(startTimeMinutes);

    let image = null;

    if (req?.file) {
      const uploadResponse = await uploadBusiness({
        file: req.file,
        folderName: req?.body?.folderName,
      });

      if (!uploadResponse?.success) {
        return next(createError(404, "Error uploading image."));
      }

      image = uploadResponse.url;
    }

    const updateInitiative = new Initiative(initiative);

    updateInitiative.endTime = endTime ?? initiative?.endTime;

    updateInitiative.startTime = startTime ?? initiative?.startTime;

    updateInitiative.goals = JSON.parse(req.body.goals) ?? initiative?.endTime;

    updateInitiative.location =
      JSON.parse(req.body.location) ?? initiative?.location;

    updateInitiative.servicesNeeded =
      JSON.parse(req.body.servicesNeeded) ?? initiative?.servicesNeeded;

    updateInitiative.whatMovesThisInitiative =
      JSON.parse(req.body.whatMovesThisInitiative) ??
      initiative?.whatMovesThisInitiative;

    updateInitiative.whichAreasAreCoveredByThisInitiative =
      JSON.parse(req.body.whichAreasAreCoveredByThisInitiative) ??
      initiative?.whichAreasAreCoveredByThisInitiative;

    updateInitiative.image = ([image] as string[]) ?? initiative?.image;

    updateInitiative.website = req.body.website ?? initiative?.website;

    updateInitiative.eventItemFrame =
      req.body.eventItemFrame ?? initiative?.eventItemFrame;

    updateInitiative.eventItemType =
      req.body.eventItemType ?? initiative?.eventItemType;

    updateInitiative.initiativeName =
      req.body.initiativeName ?? initiative?.initiativeName;

    updateInitiative.status = req.body.status ?? initiative?.status;

    updateInitiative.description =
      req.body.description ?? initiative?.description;

    updateInitiative.startDate = req.body.startDate ?? initiative?.startDate;

    updateInitiative.endDate = req.body.endDate ?? initiative?.endDate;

    updateInitiative.postalCode = req.body.postalCode ?? initiative?.postalCode;

    // An initiative edit must not overwrite an applicant
    // list that changed after the initiative was loaded.
    const { applicants, _id, ...fieldsToUpdate } = updateInitiative.toObject();

    const updatedInitiative = await Initiative.findByIdAndUpdate(
      id,
      {
        $set: fieldsToUpdate,
      },
      {
        upsert: true,
        returnOriginal: false,
        runValidators: true,
      }
    );

    if (!updatedInitiative) {
      return next(createError(404, "Initiative not updated."));
    }

    return res.status(200).send({
      data: updatedInitiative,
      success: true,
      message: "Initiative successfully updated.",
    });
  } catch (error) {
    next(error);
  }
};

// Ownership is always taken from the authenticated session, never from query parameters.
export const getOwnedInitiatives = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id)
      return next(createError(401, "Authentication required."));
    res.setHeader("Cache-Control", "private, no-store");
    const data = await Initiative.find({ userId: req.user._id })
      .select(
        "initiativeName description location image servicesNeeded status createdAt userId"
      )
      .sort({ createdAt: -1, _id: -1 });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};