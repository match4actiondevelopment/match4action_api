const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const { User } = require("../models/User");
const { Initiative } = require("../models/Initiatives");
const { Application } = require("../models/Application");
const { AuditLog } = require("../models/AuditLog");
const reports = require("../routes/reports").default;
const { parseFilters, csvCell } = require("../services/reports");
const { isAllowedWebOrigin } = require("../config/webOrigins");

jest.setTimeout(120000);
let database, app, orgA, orgB, admin, alice, bob, carol, roleA, roleB, a1, a2, b1;
const cookie = (user, role = user.role) => `access_token=${jwt.sign(
  { _id: String(user._id), role }, process.env.ACCESS_TOKEN_PRIVATE_KEY
)}`;
const read = (path = "/reports", user = orgA, query = { range: "all" }) =>
  request(app).get(path).set("Cookie", cookie(user)).query(query);
const person = (name, role) => User.create({
  name, role, email: `${name.toLowerCase()}@example.com`, password: "test-only-password",
  provider: { id: name, name: "credentials" }, termsAndConditions: true,
});
const application = (user, role, owner, extras = {}) => Application.create({
  userId: user._id, initiativeId: role._id, organisationId: owner._id,
  roleName: role.initiativeName, organisationName: owner.name,
  appliedAt: new Date("2026-10-02T12:00:00Z"), consentTimestamp: new Date("2026-10-02T12:00:00Z"),
  ...extras,
});

beforeAll(async () => {
  process.env.ACCESS_TOKEN_PRIVATE_KEY = "isolated-report-test-secret";
  database = await MongoMemoryServer.create({ binary: { version: "7.0.14" } });
  await mongoose.connect(database.getUri(), { dbName: "report_tests" });
  await Promise.all([User.init(), Initiative.init(), Application.init(), AuditLog.init()]);
  app = express();
  app.use(cookieParser()); app.use(express.json()); app.use("/reports", reports);
  app.use((error, _req, res, _next) => res.status(error.status || 500).json({ message: error.message }));
});
beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Initiative.deleteMany({}), Application.deleteMany({}), AuditLog.deleteMany({})]);
  [orgA, orgB, admin, alice, bob, carol] = await Promise.all([
    person("OrgA", "organization"), person("OrgB", "organization"), person("Admin", "admin"),
    person("Alice", "volunteer"), person("Bob", "volunteer"), person("Carol", "volunteer"),
  ]);
  process.env.REPORT_ADMIN_IDS = String(admin._id);
  roleA = await Initiative.create({ userId: orgA._id, initiativeName: "A Role", description: "A",
    servicesNeeded: ["Testing"], location: { city: "Chicago", country: "US" }, applicants: [alice._id, carol._id, carol._id] });
  roleB = await Initiative.create({ userId: orgB._id, initiativeName: "B Role", description: "B", servicesNeeded: ["Testing"] });
  a1 = await application(alice, roleA, orgA, { volunteerName: "Alice snapshot", volunteerEmail: "alice@example.com",
    opportunityLocation: "Chicago, US", applicationSource: "recommendations" });
  a2 = await application(bob, roleA, orgA, { appliedAt: new Date("2026-09-30T23:59:59.999Z"), status: "declined" });
  b1 = await application(alice, roleB, orgB, { volunteerEmail: "foreign-private@example.com" });
});
afterAll(async () => { await mongoose.disconnect(); if (database) await database.stop(); });

test("organisation sees its own records with legacy deduplication and private caching", async () => {
  const result = await read();
  expect(result.status).toBe(200);
  expect(result.headers["cache-control"]).toBe("private, no-store");
  expect(result.body.data.total).toBe(3);
  expect(result.body.data.rows.filter(row => row.legacy)).toHaveLength(1);
  expect(result.body.data.summary.undated).toBe(1);
  expect(JSON.stringify(result.body)).not.toMatch(/foreign-private|password|test-only-password/);
  expect(result.body.data.rows.every(row => row.organisationId === String(orgA._id))).toBe(true);
});
test("all report endpoints reject volunteers and unauthenticated visitors", async () => {
  for (const path of ["/reports", "/reports/export", "/reports/roles", `/reports/applications/${a1._id}`]) {
    expect((await read(path, alice, {})).status).toBe(403);
    expect((await request(app).get(path)).status).toBe(401);
  }
});
test("approved platform admin sees all organisations", async () => {
  const result = await read("/reports", admin);
  expect(result.status).toBe(200); expect(result.body.data.total).toBe(4);
});
test("database admin still requires the approved admin list", async () => {
  process.env.REPORT_ADMIN_IDS = "";
  expect((await read("/reports", admin)).status).toBe(403);
});
test("a forged token role does not override the database role", async () => {
  expect((await request(app).get("/reports").set("Cookie", cookie(alice, "admin"))).status).toBe(403);
});
test("pending onboarding does not grant report access", async () => {
  await User.updateOne({ _id: orgA._id }, { $set: { roleSelectionPending: true } });
  expect((await read()).status).toBe(403);
});
test("client cannot replace organisation scope", async () => {
  expect((await read("/reports", orgA, { range: "all", organisationId: String(orgB._id) })).status).toBe(400);
  expect((await read("/reports", orgA, { range: "all", role: String(roleB._id) })).body.data.total).toBe(0);
});
test("role options are scoped", async () => {
  const result = await read("/reports/roles", orgA, {});
  expect(result.status).toBe(200);
  expect(result.body.data.map(role => role._id)).toEqual([String(roleA._id)]);
});
test("details enforce scope for durable and legacy applications", async () => {
  expect((await read(`/reports/applications/${a1._id}`, orgA, {})).status).toBe(200);
  expect((await read(`/reports/applications/${b1._id}`, orgA, {})).status).toBe(404);
  const legacy = `/reports/applications/legacy-${roleA._id}-${carol._id}`;
  expect((await read(legacy, orgA, {})).status).toBe(200);
  expect((await read(legacy, orgB, {})).status).toBe(404);
});
test("custom range includes the whole final UTC day and excludes undated records", async () => {
  await Application.updateOne({ _id: a1._id }, { $set: { appliedAt: new Date("2026-10-02T23:59:59.999Z") } });
  await Application.updateOne({ _id: a2._id }, { $set: { appliedAt: new Date("2026-10-03T00:00:00Z") } });
  const result = await read("/reports", orgA, { range: "custom", from: "2026-10-02", to: "2026-10-02" });
  expect(result.status).toBe(200); expect(result.body.data.total).toBe(1);
  expect(result.body.data.summary.undated).toBe(0);
});
test("calendar periods use UTC and Monday weeks including leap years", () => {
  const week = parseFilters({ range: "week" }, new Date("2026-03-01T23:30:00-06:00"));
  expect(week.start.toISOString()).toBe("2026-03-02T00:00:00.000Z");
  expect(week.end.toISOString()).toBe("2026-03-09T00:00:00.000Z");
  const month = parseFilters({ range: "month" }, new Date("2028-02-29T12:00:00Z"));
  expect(month.end.toISOString()).toBe("2028-03-01T00:00:00.000Z");
});
test.each([
  { range: "custom", from: "2026-02-30", to: "2026-03-01" },
  { range: "custom", from: "2026-10-03", to: "2026-10-02" },
  { range: "custom", from: "2026-10-02" }, { range: "all", from: "2026-10-02" },
  { range: "year" }, { role: "bad" }, { status: "bad" }, { source: "bad" },
  { page: "0" }, { pageSize: "101" }, { location: { $ne: "" } },
])("rejects invalid filters %p", filters => { expect(() => parseFilters(filters)).toThrow(); });
test("role status source and location filters combine", async () => {
  const result = await read("/reports", orgA, { range: "all", role: String(roleA._id), status: "applied",
    source: "recommendations", location: "chicago" });
  expect(result.body.data.total).toBe(1);
  expect((await read("/reports", orgA, { range: "all", source: "unknown" })).body.data.total).toBe(2);
});
test("location search treats regular expression characters literally", async () => {
  expect((await read("/reports", orgA, { range: "all", location: ".*" })).body.data.total).toBe(0);
});
test("modern snapshots survive deleted users and roles without invented data", async () => {
  await User.deleteOne({ _id: alice._id }); await Initiative.deleteOne({ _id: roleA._id });
  let result = await read(`/reports/applications/${a1._id}`, orgA, {});
  expect(result.body.data.volunteerEmail).toBe("alice@example.com");
  expect(result.body.data.roleName).toBe("A Role");
  await Application.updateOne({ _id: a1._id }, { $unset: { volunteerName: "" } });
  result = await read(`/reports/applications/${a1._id}`, orgA, {});
  expect(result.body.data.volunteerName).toBeNull();
});
test("CSV applies the same ownership and filters", async () => {
  const result = await read("/reports/export", orgA, { range: "all", source: "recommendations" });
  expect(result.status).toBe(200); expect(result.headers["content-type"]).toMatch(/text\/csv/);
  expect(result.text).toContain("alice@example.com"); expect(result.text).not.toContain("foreign-private");
  expect(result.text.trim().split("\r\n")).toHaveLength(2);
});
test("CSV includes every matching row beyond the table page", async () => {
  for (let i = 0; i < 27; i++) await application({ _id: new mongoose.Types.ObjectId() }, roleA, orgA, { volunteerName: `Extra ${i}` });
  const table = await read("/reports", orgA, { range: "all", pageSize: "2" });
  expect(table.body.data.rows).toHaveLength(2); expect(table.body.data.total).toBe(30);
  const csv = await read("/reports/export");
  expect(csv.text.trim().split("\r\n")).toHaveLength(31);
});
test("CSV escapes text and neutralises formula cells", () => {
  expect(csvCell('A,"B"\nC')).toBe('"A,""B""\nC"');
  for (const value of ["=SUM(1,2)", " +cmd", "@cmd", "-cmd", "\tcmd"]) expect(csvCell(value)).toBe('"\'' + value + '"');
});
test("audit records sensitive reads and exports without copying applicant email", async () => {
  await read(); await read(`/reports/applications/${a1._id}`, orgA, {}); await read("/reports/export");
  const logs = await AuditLog.find({}).lean();
  expect(logs.map(log => log.event).sort()).toEqual(["report_application_viewed", "report_export_generated", "report_viewed"]);
  expect(JSON.stringify(logs)).not.toMatch(/alice@example|foreign-private/);
});
test("empty results are valid and CSV retains its header", async () => {
  const filters = { range: "all", status: "accepted" };
  expect((await read("/reports", orgA, filters)).body.data.total).toBe(0);
  expect((await read("/reports/export", orgA, filters)).text.trim().split("\r\n")).toHaveLength(1);
});
test("CORS accepts configured origins but not arbitrary Vercel sites", () => {
  const previous = { CLIENT_BASE_URL: process.env.CLIENT_BASE_URL, ALLOWED_WEB_ORIGINS: process.env.ALLOWED_WEB_ORIGINS };
  try {
    process.env.CLIENT_BASE_URL = "https://approved.example.com";
    process.env.ALLOWED_WEB_ORIGINS = "https://staging-example.vercel.app";
    expect(isAllowedWebOrigin("https://staging-example.vercel.app")).toBe(true);
    expect(isAllowedWebOrigin("https://unrelated.vercel.app")).toBe(false);
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});