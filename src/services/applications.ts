import mongoose from "mongoose";
import { Application } from "../models/Application";
import { Initiative } from "../models/Initiatives";
import { User } from "../models/User";
import { Notification } from "../models/Notification";
import { createError } from "../utils/createError";
import { dispatchNotification } from "./notifications";

const alreadyApplied = () =>
  createError(
    409,
    "You have already applied to this opportunity."
  );

export async function createApplication(
  userId: string,
  initiativeId: string
) {
  if (!mongoose.isValidObjectId(initiativeId)) {
    throw createError(400, "Invalid initiative id.");
  }

  await Promise.all([
    Application.init(),
    Notification.init(),
  ]);

  let result: any;

  await mongoose.connection
    .transaction(async (session) => {
      const initiative = await Initiative.findById(
        initiativeId
      ).session(session);

      if (!initiative) {
        throw createError(404, "Initiative not found.");
      }

      const existing = await Application.exists({
        userId,
        initiativeId,
      }).session(session);

      const isLegacyApplicant =
        initiative.applicants.some(
          (id) => String(id) === userId
        );

      if (existing || isLegacyApplicant) {
        throw alreadyApplied();
      }

      if (
        initiative.status &&
        initiative.status !== "active"
      ) {
        throw createError(
          409,
          "This initiative is not accepting applications."
        );
      }

      const updated = await Initiative.updateOne(
        {
          _id: initiativeId,
          $or: [
            { status: "active" },
            { status: { $exists: false } },
          ],
          applicants: {
            $ne: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $addToSet: {
            applicants: userId,
          },
        },
        {
          session,
          runValidators: true,
        }
      );

      if (updated.modifiedCount !== 1) {
        throw createError(
          409,
          "This opportunity could not accept the application."
        );
      }

      const owner = await User.findById(
        initiative.userId
      )
        .select("name")
        .session(session);

      const now = new Date();

      const [application] = await Application.create(
        [
          {
            userId,
            initiativeId,
            organisationId: initiative.userId,
            roleName: initiative.initiativeName,
            organisationName: owner?.name || null,
            status: "applied",
            appliedAt: now,
            consentTimestamp: now,
          },
        ],
        { session }
      );

      const volunteer = await User.findById(userId)
        .select("name email")
        .session(session);

      await Notification.create(
        [
          {
            applicationId: application._id,
            organisationId: initiative.userId,
            initiativeId: initiative._id,
            roleName: application.roleName,
            volunteerName: volunteer?.name || "",
            volunteerEmail: volunteer?.email || "",
            appliedAt: application.appliedAt,
          },
        ],
        { session }
      );

      result = {
        applicationId: application._id,
        initiativeId,
        applied: true,
        status: application.status,
        appliedAt: application.appliedAt,
      };
    })
    .catch((error) => {
      if (error?.code === 11000) {
        throw alreadyApplied();
      }

      throw error;
    });

  // Application is committed. Notification errors must not
  // turn this successful application into a failed response.
  try {
    result.notificationStatus =
      await dispatchNotification(
        String(result.applicationId)
      );
  } catch {
    console.error(
      "Notification processing needs review for application",
      String(result.applicationId)
    );

    result.notificationStatus = "pending";
  }

  return result;
}

export async function listApplications(userId: string) {
  const applications = await Application.find({ userId })
    .sort({ appliedAt: -1 })
    .lean();

  const known = applications.map(
    (application) => application.initiativeId
  );

  const legacy = await Initiative.find({
    applicants: userId,
    _id: { $nin: known },
  })
    .select("initiativeName userId")
    .populate("userId", "name")
    .lean();

  return [
    ...applications.map((application) => ({
      applicationId: String(application._id),
      initiativeId: String(application.initiativeId),
      roleName: application.roleName,
      organisationName: application.organisationName,
      appliedAt: application.appliedAt,
      status: application.status,
      legacy: false,
    })),

    ...legacy.map((initiative) => ({
      applicationId: `legacy-${initiative._id}`,
      initiativeId: String(initiative._id),
      roleName: initiative.initiativeName,
      organisationName:
        (initiative.userId as any)?.name || null,
      appliedAt: null,
      status: "applied",
      legacy: true,
    })),
  ];
}