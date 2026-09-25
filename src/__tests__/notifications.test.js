jest.mock("../service/upload", () => ({
  uploadBusiness: jest.fn(),
}));

jest.mock("../services/notificationEmail", () => ({
  ...jest.requireActual(
    "../services/notificationEmail"
  ),
  sendEmail: jest.fn(),
}));

const {
  MongoMemoryReplSet,
} = require("mongodb-memory-server");
const mongoose = require("mongoose");
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const request = require("supertest");

const { User } = require("../models/User");
const {
  Initiative,
} = require("../models/Initiatives");
const {
  Application,
} = require("../models/Application");
const {
  Notification,
} = require("../models/Notification");
const {
  createApplication,
} = require("../services/applications");
const {
  dispatchNotification,
} = require("../services/notifications");
const {
  sendEmail,
} = require("../services/notificationEmail");
const notifications =
  require("../routes/notifications").default;

jest.setTimeout(120000);

let server;
let app;
let owner;
let volunteer;
let admin;
let role;

const apply = () =>
  createApplication(
    String(volunteer),
    String(role._id)
  );

const cookie = (id, role = "admin") =>
  `access_token=${jwt.sign(
    { _id: String(id), role },
    process.env.ACCESS_TOKEN_PRIVATE_KEY
  )}`;

beforeAll(async () => {
  process.env.ACCESS_TOKEN_PRIVATE_KEY =
    "epic4-test-only";

  server = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
    binary: { version: "7.0.14" },
  });

  await mongoose.connect(server.getUri(), {
    dbName: "epic4_tests",
  });

  await Promise.all([
    User.init(),
    Initiative.init(),
    Application.init(),
    Notification.init(),
  ]);

  app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/notifications", notifications);

  app.use((err, req, res, next) =>
    res.status(err.status || 500).json({
      message: err.message,
    })
  );
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Initiative.deleteMany({}),
    Application.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  owner = new mongoose.Types.ObjectId();
  volunteer = new mongoose.Types.ObjectId();
  admin = new mongoose.Types.ObjectId();

  await User.collection.insertMany([
    {
      _id: owner,
      name: "Organisation",
      email: "owner@example.org",
      role: "organization",
    },
    {
      _id: volunteer,
      name: "Volunteer",
      email: "volunteer@example.org",
      role: "volunteer",
    },
    {
      _id: admin,
      name: "Admin",
      email: "admin@example.org",
      role: "admin",
    },
  ]);

  role = await Initiative.create({
    userId: owner,
    initiativeName: "Mentor",
    description: "Test",
    servicesNeeded: ["Mentoring"],
  });

  process.env.EMAIL_MODE = "test";
  process.env.NOTIFICATION_ADMIN_IDS =
    String(admin);
  process.env.EMAIL_FROM =
    "notifications@example.org";
  process.env.EMAIL_TEST_TO =
    "test@example.org";
  process.env.RESEND_API_KEY =
    "test-key-never-sent";
  process.env.ORG_NOTIFICATION_EMAILS =
    JSON.stringify({
      [owner]: ["organisation@example.org"],
    });
  process.env.NOTIFICATION_WEB_URL =
    "https://staging.example.org";
  process.env.VERCEL_ENV = "preview";

  sendEmail.mockResolvedValue(
    "provider-message-1"
  );
});

afterAll(async () => {
  await mongoose.disconnect();

  if (server) {
    await server.stop();
  }
});

test("saves application and sends only to test inbox", async () => {
  const result = await apply();
  const record = await Notification.findOne({});

  expect(result.notificationStatus).toBe(
    "test_sent"
  );
  expect(record.status).toBe("test_sent");
  expect(record.intendedRecipients).toEqual([
    "organisation@example.org",
  ]);

  expect(sendEmail).toHaveBeenCalledWith(
    expect.objectContaining({
      to: ["test@example.org"],
      subject:
        "[STAGING TEST] New volunteer application for Mentor",
      text: expect.stringContaining(
        "volunteer@example.org"
      ),
    }),
    `application-${result.applicationId}`
  );

  expect(record.payload.text).toContain(
    record.appliedAt.toISOString()
  );
  expect(record.payload.text).toContain(
    `/initiatives/${role._id}`
  );
  expect(record.providerMessageId).toBe(
    "provider-message-1"
  );
  expect(
    await Application.countDocuments()
  ).toBe(1);
});

test("live mode uses configured organisation recipient", async () => {
  process.env.EMAIL_MODE = "live";
  process.env.VERCEL_ENV = "production";

  const result = await apply();

  expect(result.notificationStatus).toBe(
    "sent"
  );
  expect(
    sendEmail.mock.calls[0][0].to
  ).toEqual(["organisation@example.org"]);
});

test("sending happens after application commit", async () => {
  sendEmail.mockImplementation(async () => {
    expect(
      await Application.countDocuments()
    ).toBe(1);

    const savedRole =
      await Initiative.findById(role._id);

    expect(
      savedRole.applicants.map(String)
    ).toContain(String(volunteer));

    return "committed";
  });

  await apply();

  expect(sendEmail).toHaveBeenCalledTimes(1);
});

test("duplicate apply does not send another notification", async () => {
  await apply();

  await expect(apply()).rejects.toMatchObject({
    status: 409,
  });

  expect(
    await Notification.countDocuments()
  ).toBe(1);
  expect(sendEmail).toHaveBeenCalledTimes(1);
});

test("inactive role creates no notification", async () => {
  await Initiative.updateOne(
    { _id: role._id },
    { $set: { status: "inactive" } }
  );

  await expect(apply()).rejects.toMatchObject({
    status: 409,
  });

  expect(
    await Notification.countDocuments()
  ).toBe(0);
  expect(sendEmail).not.toHaveBeenCalled();
});

test("notification write failure rolls back application", async () => {
  jest
    .spyOn(Notification, "create")
    .mockRejectedValueOnce(
      new Error("write failure")
    );

  await expect(apply()).rejects.toThrow(
    "write failure"
  );

  expect(
    await Application.countDocuments()
  ).toBe(0);

  expect(
    (await Initiative.findById(role._id))
      .applicants
  ).toHaveLength(0);

  expect(sendEmail).not.toHaveBeenCalled();
});

test("provider failure preserves application", async () => {
  sendEmail.mockRejectedValue(
    new Error("EMAIL_TIMEOUT")
  );

  const result = await apply();
  const record = await Notification.findOne({});

  expect(result.applied).toBe(true);
  expect(result.notificationStatus).toBe(
    "failed"
  );
  expect(record.failureReason).toBe(
    "EMAIL_TIMEOUT"
  );
  expect(record.attempts).toBe(1);
  expect(
    record.nextAttemptAt.getTime()
  ).toBeGreaterThan(Date.now());

  expect(
    await Application.countDocuments()
  ).toBe(1);
});

test("missing recipients are traceable", async () => {
  process.env.ORG_NOTIFICATION_EMAILS = "{}";

  expect(
    (await apply()).notificationStatus
  ).toBe("failed");

  expect(
    (await Notification.findOne({}))
      .failureReason
  ).toBe(
    "MISSING_OR_INVALID_ORGANISATION_RECIPIENT"
  );

  expect(
    await Application.countDocuments()
  ).toBe(1);
  expect(sendEmail).not.toHaveBeenCalled();
});

test("disabled mode leaves a pending record", async () => {
  process.env.EMAIL_MODE = "disabled";

  expect(
    (await apply()).notificationStatus
  ).toBe("pending");

  expect(
    (await Notification.findOne({})).status
  ).toBe("pending");

  expect(sendEmail).not.toHaveBeenCalled();
});

test("concurrent retry workers send once", async () => {
  process.env.EMAIL_MODE = "disabled";
  const result = await apply();
  process.env.EMAIL_MODE = "test";

  await Promise.all([
    dispatchNotification(
      String(result.applicationId)
    ),
    dispatchNotification(
      String(result.applicationId)
    ),
  ]);

  expect(sendEmail).toHaveBeenCalledTimes(1);
});

test("retry preserves original payload and key", async () => {
  sendEmail.mockRejectedValueOnce(
    new Error("EMAIL_TIMEOUT")
  );

  const result = await apply();
  const firstCall = sendEmail.mock.calls[0];

  process.env.EMAIL_FROM =
    "changed@example.org";
  process.env.EMAIL_TEST_TO =
    "changed-test@example.org";

  await Notification.updateOne(
    {},
    { $set: { nextAttemptAt: new Date(0) } }
  );

  expect(
    await dispatchNotification(
      String(result.applicationId)
    )
  ).toBe("test_sent");

  expect(sendEmail.mock.calls[1]).toEqual(
    firstCall
  );
});

test("expired safe retry window requires review", async () => {
  sendEmail.mockRejectedValueOnce(
    new Error("EMAIL_TIMEOUT")
  );

  const result = await apply();

  await Notification.updateOne(
    {},
    {
      $set: {
        nextAttemptAt: new Date(0),
        firstAttemptAt: new Date(
          Date.now() - 24 * 3600000
        ),
      },
    }
  );

  expect(
    await dispatchNotification(
      String(result.applicationId)
    )
  ).toBe("needs_review");

  expect(sendEmail).toHaveBeenCalledTimes(1);
});

test("abandoned worker lease can be recovered", async () => {
  process.env.EMAIL_MODE = "disabled";
  const result = await apply();
  process.env.EMAIL_MODE = "test";

  await Notification.updateOne(
    {},
    {
      $set: {
        status: "processing",
        lockedUntil: new Date(0),
        lockToken: "old",
      },
    }
  );

  expect(
    await dispatchNotification(
      String(result.applicationId)
    )
  ).toBe("test_sent");
});

test("stops after three provider attempts", async () => {
  sendEmail.mockRejectedValue(
    new Error("EMAIL_PROVIDER_HTTP_503")
  );

  const result = await apply();

  for (let i = 0; i < 2; i++) {
    await Notification.updateOne(
      {},
      {
        $set: {
          nextAttemptAt: new Date(0),
        },
      }
    );

    await dispatchNotification(
      String(result.applicationId)
    );
  }

  expect(
    (await Notification.findOne({})).status
  ).toBe("needs_review");

  await dispatchNotification(
    String(result.applicationId)
  );

  expect(sendEmail).toHaveBeenCalledTimes(3);
});

test("admin list is private and omits email body", async () => {
  await apply();

  const result = await request(app)
    .get("/notifications")
    .set("Cookie", cookie(admin));

  expect(result.status).toBe(200);
  expect(
    result.headers["cache-control"]
  ).toBe("private, no-store");
  expect(
    result.body.data[0].payload
  ).toBeUndefined();
  expect(
    result.body.data[0].volunteerEmail
  ).toBeUndefined();
});

test("non-admins cannot read or retry notifications", async () => {
  await apply();
  const record = await Notification.findOne({});

  expect(
    (await request(app).get("/notifications"))
      .status
  ).toBe(401);

  for (const id of [volunteer, owner]) {
    expect(
      (
        await request(app)
          .get("/notifications")
          .set("Cookie", cookie(id))
      ).status
    ).toBe(403);

    expect(
      (
        await request(app)
          .post(
            `/notifications/${record._id}/retry`
          )
          .set("Cookie", cookie(id))
      ).status
    ).toBe(403);
  }
});

test("self-edited admin role cannot bypass allowlist", async () => {
  await User.collection.updateOne(
    { _id: volunteer },
    { $set: { role: "admin" } }
  );

  expect(
    (
      await request(app)
        .get("/notifications")
        .set("Cookie", cookie(volunteer))
    ).status
  ).toBe(403);
});

test("admin retry enforces cooldown and no resend", async () => {
  sendEmail.mockRejectedValueOnce(
    new Error("EMAIL_TIMEOUT")
  );

  await apply();
  const record = await Notification.findOne({});

  const retry = () =>
    request(app)
      .post(
        `/notifications/${record._id}/retry`
      )
      .set("Cookie", cookie(admin));

  expect((await retry()).status).toBe(409);

  await Notification.updateOne(
    {},
    { $set: { nextAttemptAt: new Date(0) } }
  );

  expect(
    (await retry()).body.data.status
  ).toBe("test_sent");

  expect((await retry()).status).toBe(409);
});