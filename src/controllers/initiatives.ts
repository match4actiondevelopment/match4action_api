import {
  NextFunction,
  Request,
  Response,
} from "express";
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
    const {
      country,
      city,
      location,
      search,
      q,
    } = req.query;

    const filter: any = {};

    if (country || city) {
      filter.location = {};

      if (country) {
        filter.location.country = {
          $regex: country as string,
          $options: "i",
        };
      }

      if (city) {
        filter.location.city = {
          $regex: city as string,
          $options: "i",
        };
      }
    } else if (location) {
      const locationRegex = {
        $regex: location as string,
        $options: "i",
      };

      filter.$or = [
        { "location.city": locationRegex },
        { "location.country": locationRegex },
      ];
    }

    const searchQuery = search || q;

    if (searchQuery) {
      const searchRegex = {
        $regex: searchQuery as string,
        $options: "i",
      };

      const searchConditions: any[] = [
        { initiativeName: searchRegex },
        { description: searchRegex },
        { servicesNeeded: searchRegex },
        { whatMovesThisInitiative: searchRegex },
        { whichAreasAreCoveredByThisInitiative: searchRegex },
      ];

      if (filter.$or || filter.location) {
        filter.$and = [
          ...(filter.$or
            ? [{ $or: filter.$or }]
            : []),
          ...(filter.location
            ? [{ location: filter.location }]
            : []),
          { $or: searchConditions },
        ];

        delete filter.$or;
        delete filter.location;
      } else {
        filter.$or = searchConditions;
      }
    }

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
    const initiative = await Initiative.findById(
      req?.params?.id
    )
      .populate("goals", "name image")
      .populate("userId", "name");

    if (!initiative) {
      return next(
        createError(404, "Initiative not found.")
      );
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
    const userId = new mongoose.Types.ObjectId(
      req?.user?._id
    );

    const initiatives = await Initiative.find({
      applicants: userId,
    })
      .populate("goals", "name image")
      .populate("userId", "name");

    if (!initiatives) {
      return next(
        createError(404, "User initiatives not found.")
      );
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
    const endTime = new Date();
    const startTime = new Date();

    let image = null;

    if (req?.file) {
      const uploadResponse = await uploadBusiness({
        file: req.file,
        folderName: req?.body?.folderName,
      });

      if (!uploadResponse?.success) {
        return next(
          createError(404, "Error uploading image.")
        );
      }

      image = uploadResponse.url;
    }

    const initiative = new Initiative({
      ...req.body,
      startTime,
      endTime,
      image: [image],
      userId: req?.user?._id,
      whatMovesThisInitiative:
        req.body.whatMovesThisInitiative,
      servicesNeeded: req.body.servicesNeeded,
      whichAreasAreCoveredByThisInitiative:
        req.body.whichAreasAreCoveredByThisInitiative,
      location: {
        country: req.body.location.country,
        city: req.body.location.city,
      },
    });

    const { _id } = await initiative.save();

    const createdInitiative =
      await Initiative.findById(_id);

    if (!createdInitiative) {
      return next(
        createError(404, "Initiative not created.")
      );
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
    const objectId = new mongoose.Types.ObjectId(
      req.params.id
    );

    const initiative =
      await Initiative.findById(objectId);

    if (!initiative) {
      return next(
        createError(404, "Initiative not found.")
      );
    }

    if (
      req?.user?._id !==
      initiative?.userId?.toString()
    ) {
      return next(
        createError(
          403,
          "You can delete only your initiatives."
        )
      );
    }

    const deletedInitiative =
      await Initiative.findOneAndDelete(objectId);

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
    const id = new mongoose.Types.ObjectId(
      req?.params?.id
    );

    const initiative = await Initiative.findById(id);

    if (
      req?.user?._id !==
      initiative?.userId?.toString()
    ) {
      return next(
        createError(
          403,
          "You can update only your initiatives."
        )
      );
    }

    const endTime = new Date();

    const [endTimeHour, endTimeMinutes] =
      req?.body?.endTime?.split(":");

    endTime.setHours(endTimeHour);
    endTime.setMinutes(endTimeMinutes);

    const startTime = new Date();

    const [startTimeHour, startTimeMinutes] =
      req?.body?.startTime?.split(":");

    startTime.setHours(startTimeHour);
    startTime.setMinutes(startTimeMinutes);

    let image = null;

    if (req?.file) {
      const uploadResponse = await uploadBusiness({
        file: req.file,
        folderName: req?.body?.folderName,
      });

      if (!uploadResponse?.success) {
        return next(
          createError(404, "Error uploading image.")
        );
      }

      image = uploadResponse.url;
    }

    const updateInitiative =
      new Initiative(initiative);

    updateInitiative.endTime =
      endTime ?? initiative?.endTime;

    updateInitiative.startTime =
      startTime ?? initiative?.startTime;

    updateInitiative.goals =
      JSON.parse(req.body.goals) ??
      initiative?.endTime;

    updateInitiative.location =
      JSON.parse(req.body.location) ??
      initiative?.location;

    updateInitiative.servicesNeeded =
      JSON.parse(req.body.servicesNeeded) ??
      initiative?.servicesNeeded;

    updateInitiative.whatMovesThisInitiative =
      JSON.parse(req.body.whatMovesThisInitiative) ??
      initiative?.whatMovesThisInitiative;

    updateInitiative.whichAreasAreCoveredByThisInitiative =
      JSON.parse(
        req.body.whichAreasAreCoveredByThisInitiative
      ) ??
      initiative?.whichAreasAreCoveredByThisInitiative;

    updateInitiative.image =
      ([image] as string[]) ?? initiative?.image;

    updateInitiative.website =
      req.body.website ?? initiative?.website;

    updateInitiative.eventItemFrame =
      req.body.eventItemFrame ??
      initiative?.eventItemFrame;

    updateInitiative.eventItemType =
      req.body.eventItemType ??
      initiative?.eventItemType;

    updateInitiative.initiativeName =
      req.body.initiativeName ??
      initiative?.initiativeName;

    updateInitiative.status =
      req.body.status ?? initiative?.status;

    updateInitiative.description =
      req.body.description ?? initiative?.description;

    updateInitiative.startDate =
      req.body.startDate ?? initiative?.startDate;

    updateInitiative.endDate =
      req.body.endDate ?? initiative?.endDate;

    updateInitiative.postalCode =
      req.body.postalCode ?? initiative?.postalCode;

    // An initiative edit must not overwrite an applicant
    // list that changed after the initiative was loaded.
    const {
      applicants,
      _id,
      ...fieldsToUpdate
    } = updateInitiative.toObject();

    const updatedInitiative =
      await Initiative.findByIdAndUpdate(
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
      return next(
        createError(404, "Initiative not updated.")
      );
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