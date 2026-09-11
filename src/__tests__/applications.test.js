jest.mock("../service/upload", () => ({
  uploadBusiness: jest.fn(),
}));

const {
  MongoMemoryReplSet,
} = require("mongodb-memory-server");
const mongoose = require("mongoose");
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const request = require("supertest");

const {
  Application,
} = require("../models/Application");
const {
  Initiative,
} = require("../models/Initiatives");
const { User } = require("../models/User");
const {
  createApplication,
} = require("../services/applications");
const {
  initiatives,
} = require("../routes/initiatives");

jest.setTimeout(120000);

let database;
let app;
let initiative;
let ownerId;
let volunteerId;

const cookie = (
  id = volunteerId,
  role = "volunteer"
) =>
  `access_token=${jwt.sign(
    { _id: String(id), role },
    process.env.ACCESS_TOKEN_PRIVATE_KEY
  )}`;

const apply = (
  id = initiative._id,
  userId = volunteerId
) =>
  request(app)
    .patch(`/initiatives/apply/${id}`)
    .set("Cookie", cookie(userId));

beforeAll(async () => {
  process.env.ACCESS_TOKEN_PRIVATE_KEY =
    "epic3-test-only-secret";

  database = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
    binary: { version: "7.0.14" },
  });

  await mongoose.connect(database.getUri(), {
    dbName: "epic3_tests",
  });

  await Promise.all([
    Application.init(),
    Initiative.init(),
    User.init(),
  ]);

  app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use("/initiatives", initiatives);

  app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
      message: error.message,
    });
  });
});

beforeEach(async () => {
  await Promise.all([
    Application.deleteMany({}),
    Initiative.deleteMany({}),
    User.deleteMany({}),
  ]);

  ownerId = new mongoose.Types.ObjectId();
  volunteerId = new mongoose.Types.ObjectId();

  await User.collection.insertOne({
    _id: ownerId,
    name: "Test Organisation",
  });

  initiative = await Initiative.create({
    userId: ownerId,
    initiativeName: "Test Role",
    description: "Test opportunity",
    servicesNeeded: ["Engineering"],
  });
});

afterAll(async () => {
  await mongoose.disconnect();

  if (database) {
    await database.stop();
  }
});

test("saves date, consent, status and profile fields", async () => {
  const before = Date.now();
  const response = await apply();

  expect(response.status).toBe(200);

  const saved = await Application.findOne({
    userId: volunteerId,
  });

  expect(saved.status).toBe("applied");

  expect(saved.appliedAt.getTime())
    .toBeGreaterThanOrEqual(before);

  expect(saved.consentTimestamp)
    .toEqual(saved.appliedAt);

  expect(String(saved.organisationId))
    .toBe(String(ownerId));

  const updatedInitiative =
    await Initiative.findById(initiative._id);

  expect(
    updatedInitiative.applicants.map(String)
  ).toEqual([String(volunteerId)]);

  const list = await request(app)
    .get("/initiatives/applications/me")
    .set("Cookie", cookie());

  expect(list.status).toBe(200);

  expect(list.headers["cache-control"])
    .toBe("private, no-store");

  expect(list.body.data).toEqual([
    expect.objectContaining({
      roleName: "Test Role",
      organisationName: "Test Organisation",
      appliedAt: response.body.data.appliedAt,
      status: "applied",
      legacy: false,
    }),
  ]);
});

test("duplicate returns 409 and preserves original date", async () => {
  await apply();

  const original = await Application.findOne({});
  const duplicate = await apply();

  expect(duplicate.status).toBe(409);

  expect(duplicate.body.message)
    .toMatch(/already applied/);

  expect(await Application.countDocuments())
    .toBe(1);

  const saved = await Application.findOne({});

  expect(saved.appliedAt)
    .toEqual(original.appliedAt);
});

test("concurrent requests create one application", async () => {
  const responses = await Promise.all([
    apply(),
    apply(),
    apply(),
  ]);

  expect(
    responses
      .map((response) => response.status)
      .sort()
  ).toEqual([200, 409, 409]);

  expect(await Application.countDocuments())
    .toBe(1);

  const saved = await Initiative.findById(
    initiative._id
  );

  expect(saved.applicants).toHaveLength(1);
});

test("unique index independently rejects duplicates", async () => {
  await apply();

  const record = await Application.findOne({})
    .lean();

  delete record._id;

  await expect(
    Application.create(record)
  ).rejects.toMatchObject({ code: 11000 });
});

test("failed save rolls back the applicant array", async () => {
  jest.spyOn(Application, "create")
    .mockRejectedValueOnce(
      new Error("simulated write failure")
    );

  await expect(
    createApplication(
      String(volunteerId),
      String(initiative._id)
    )
  ).rejects.toThrow("simulated write failure");

  expect(await Application.countDocuments())
    .toBe(0);

  const saved = await Initiative.findById(
    initiative._id
  );

  expect(saved.applicants).toHaveLength(0);
});

test.each(["inactive", "closed"])(
  "rejects %s without writes",
  async (status) => {
    await Initiative.updateOne(
      { _id: initiative._id },
      { $set: { status } }
    );

    expect((await apply()).status).toBe(409);

    expect(await Application.countDocuments())
      .toBe(0);

    const saved = await Initiative.findById(
      initiative._id
    );

    expect(saved.applicants).toHaveLength(0);
  }
);

test("missing opportunity status remains active", async () => {
  await Initiative.collection.updateOne(
    { _id: initiative._id },
    { $unset: { status: "" } }
  );

  expect((await apply()).status).toBe(200);
});

test("legacy application remains visible and blocks reapplication", async () => {
  await Initiative.updateOne(
    { _id: initiative._id },
    { $addToSet: { applicants: volunteerId } }
  );

  const list = await request(app)
    .get("/initiatives/applications/me")
    .set("Cookie", cookie());

  expect(list.body.data).toEqual([
    expect.objectContaining({
      appliedAt: null,
      legacy: true,
      status: "applied",
    }),
  ]);

  expect((await apply()).status).toBe(409);

  expect(await Application.countDocuments())
    .toBe(0);
});

test("another user sees no private records and can apply", async () => {
  await apply();

  const otherUser = new mongoose.Types.ObjectId();

  const list = await request(app)
    .get(
      `/initiatives/applications/me?userId=${volunteerId}`
    )
    .set("Cookie", cookie(otherUser));

  expect(list.body.data).toEqual([]);

  const response = await apply(
    initiative._id,
    otherUser
  );

  expect(response.status).toBe(200);

  expect(await Application.countDocuments())
    .toBe(2);
});

test("multiple roles are allowed and sorted newest first", async () => {
  await apply();

  await Application.updateOne(
    {},
    {
      $set: {
        appliedAt: new Date("2020-01-01"),
      },
    }
  );

  const second = await Initiative.create({
    userId: ownerId,
    initiativeName: "Second Role",
    description: "Another opportunity",
    servicesNeeded: ["Test"],
  });

  expect((await apply(second._id)).status)
    .toBe(200);

  const list = await request(app)
    .get("/initiatives/applications/me")
    .set("Cookie", cookie());

  expect(
    list.body.data.map((item) => item.roleName)
  ).toEqual(["Second Role", "Test Role"]);
});

test("new application history survives role deletion", async () => {
  await apply();

  await Initiative.deleteOne({
    _id: initiative._id,
  });

  const list = await request(app)
    .get("/initiatives/applications/me")
    .set("Cookie", cookie());

  expect(list.body.data[0].roleName)
    .toBe("Test Role");
});

test("validates authentication, role, existence and ID", async () => {
  const unauthenticatedApply = await request(app)
    .patch(
      `/initiatives/apply/${initiative._id}`
    );

  expect(unauthenticatedApply.status)
    .toBe(401);

  const unauthenticatedList = await request(app)
    .get("/initiatives/applications/me");

  expect(unauthenticatedList.status)
    .toBe(401);

  const wrongRole = await request(app)
    .patch(
      `/initiatives/apply/${initiative._id}`
    )
    .set(
      "Cookie",
      cookie(volunteerId, "organization")
    );

  expect(wrongRole.status).toBe(403);

  const missingInitiative = await apply(
    new mongoose.Types.ObjectId()
  );

  expect(missingInitiative.status).toBe(404);

  expect((await apply("bad-id")).status)
    .toBe(400);

  expect(await Application.countDocuments())
    .toBe(0);
});

test("old endpoints cannot bypass tracking", async () => {
  for (const action of [
    "subscribe",
    "unsubscribe",
  ]) {
    const response = await request(app)
      .patch(
        `/initiatives/${action}/${initiative._id}`
      )
      .set("Cookie", cookie());

    expect(response.status).toBe(410);
  }
});