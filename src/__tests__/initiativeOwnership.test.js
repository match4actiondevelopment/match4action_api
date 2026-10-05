jest.mock("../service/upload", () => ({ uploadBusiness: jest.fn() }));
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const { Initiative } = require("../models/Initiatives");
const { User } = require("../models/User");
const { initiatives } = require("../routes/initiatives");
jest.setTimeout(120000);
let db, app, owner, other, volunteer, admin;
const cookie = (user) =>
  `access_token=${jwt.sign(
    { _id: String(user._id) },
    process.env.ACCESS_TOKEN_PRIVATE_KEY
  )}`;
const account = (name, role) =>
  User.create({
    name,
    role,
    email: `${name}@example.com`,
    password: "test-only",
    provider: { id: name, name: "credentials" },
    termsAndConditions: true,
    roleSelectionPending: false,
  });
const body = {
  initiativeName: "Mentor learners",
  description: "Teach coding",
  location: { city: "Chicago", country: "US" },
  servicesNeeded: ["Teaching"],
  eventItemFrame: "Weekly",
  eventItemType: "Remote",
  startDate: "2026-10-01",
  startTime: "2026-10-01T10:00:00Z",
};
beforeAll(async () => {
  process.env.ACCESS_TOKEN_PRIVATE_KEY = "ownership-test-only";
  db = await MongoMemoryServer.create({ binary: { version: "7.0.14" } });
  await mongoose.connect(db.getUri());
  app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/initiatives", initiatives);
  app.use((error, req, res, next) =>
    res.status(error.status || 500).json({ message: error.message })
  );
});
beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Initiative.deleteMany({})]);
  [owner, other, volunteer, admin] = await Promise.all([
    account("owner", "organization"),
    account("other", "organization"),
    account("volunteer", "volunteer"),
    account("admin", "admin"),
  ]);
});
afterAll(async () => {
  await mongoose.disconnect();
  if (db) await db.stop();
});
test("manual creation preserves dates and assigns the authenticated owner", async () => {
  const res = await request(app)
    .post("/initiatives")
    .set("Cookie", cookie(owner))
    .send({ ...body, userId: other._id, applicants: [volunteer._id] });
  expect(res.status).toBe(201);
  expect(res.body.data.userId).toBe(String(owner._id));
  expect(res.body.data.startTime).toBe("2026-10-01T10:00:00.000Z");
  expect(res.body.data.applicants).toEqual([]);
  expect(res.body.data.image).toEqual([]);
});
test("owned list cannot be switched to another owner using a query", async () => {
  await Initiative.create([
    { ...body, userId: owner._id },
    { ...body, initiativeName: "Other role", userId: other._id },
  ]);
  const res = await request(app)
    .get(`/initiatives/owned/me?userId=${other._id}`)
    .set("Cookie", cookie(owner));
  expect(res.status).toBe(200);
  expect(res.body.data).toHaveLength(1);
  expect(res.body.data[0].userId).toBe(String(owner._id));
  expect(res.body.data[0]).not.toHaveProperty("applicants");
  expect(res.headers["cache-control"]).toContain("no-store");
});
test("admin owned list means personal ownership, not all organisations", async () => {
  await Initiative.create({ ...body, userId: owner._id });
  const res = await request(app)
    .get("/initiatives/owned/me")
    .set("Cookie", cookie(admin));
  expect(res.status).toBe(200);
  expect(res.body.data).toEqual([]);
});
test("guests and volunteers cannot create or read owned lists", async () => {
  expect((await request(app).get("/initiatives/owned/me")).status).toBe(401);
  expect(
    (
      await request(app)
        .get("/initiatives/owned/me")
        .set("Cookie", cookie(volunteer))
    ).status
  ).toBe(403);
  expect(
    (
      await request(app)
        .post("/initiatives")
        .set("Cookie", cookie(volunteer))
        .send(body)
    ).status
  ).toBe(403);
  expect(await Initiative.countDocuments()).toBe(0);
});
test("legacy multipart creation parses fields without null image placeholders", async () => {
  const res = await request(app)
    .post("/initiatives")
    .set("Cookie", cookie(owner))
    .field("initiativeName", body.initiativeName)
    .field("description", body.description)
    .field("location", JSON.stringify(body.location))
    .field("servicesNeeded", '["Teaching"]')
    .field("eventTimeFrame", "Weekly")
    .field("eventType", "Remote");
  expect(res.status).toBe(201);
  expect(res.body.data.location.city).toBe("Chicago");
  expect(res.body.data.servicesNeeded).toEqual(["Teaching"]);
  expect(res.body.data.eventItemFrame).toBe("Weekly");
  expect(res.body.data.eventItemType).toBe("Remote");
});
test("malformed form data returns 400 without creating records", async () => {
  expect(
    (
      await request(app)
        .post("/initiatives")
        .set("Cookie", cookie(owner))
        .send({ ...body, servicesNeeded: "[broken" })
    ).status
  ).toBe(400);
  expect(await Initiative.countDocuments()).toBe(0);
});