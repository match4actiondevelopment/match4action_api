import mongoose from "mongoose";
import { Application } from "../models/Application";
import { Initiative } from "../models/Initiatives";
import { User } from "../models/User";
import { createError } from "../utils/createError";

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

  // Finish collection/index initialization before the transaction.
  await Application.init();

  let result: any;

  await mongoose.connection
    .transaction(async (session) => {
      const initiative = await Initiative.findById(
        initiativeId
      ).session(session);

      if (!initiative) {
        throw createError(404, "Initiative not found.");
      }

      const existingApplication = await Application.exists({
        userId,
        initiativeId,
      }).session(session);

      const isLegacyApplicant = initiative.applicants.some(
        (id) => String(id) === userId
      );

      if (existingApplication || isLegacyApplicant) {
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

      // Keep the existing applicants array compatible.
      // This write and application creation commit together.
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
          $addToSet: { applicants: userId },
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

      const owner = await User.findById(initiative.userId)
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

  return result;
}

export async function listApplications(userId: string) {
  const applications = await Application.find({ userId })
    .sort({ appliedAt: -1 })
    .lean();

  const knownInitiativeIds = applications.map(
    (application) => application.initiativeId
  );

  // Read old applications without changing their records
  // or inventing an application date.
  const legacyInitiatives = await Initiative.find({
    applicants: userId,
    _id: { $nin: knownInitiativeIds },
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

    ...legacyInitiatives.map((initiative) => ({
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