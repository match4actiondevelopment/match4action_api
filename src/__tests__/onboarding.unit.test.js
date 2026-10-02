jest.mock("../utils/secrets", () => ({ CLIENT_BASE_URL: "https://frontend.example.com" }));
jest.mock("../utils/bcrypt", () => ({ hashPassword: jest.fn() }));
jest.mock("../service/auth", () => ({ doLogin: jest.fn() }));

const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { User } = require("../models/User");
const { UserToken } = require("../models/UserToken");
const { register, refreshToken, google } = require("../controllers/auth");
const { hashPassword } = require("../utils/bcrypt");

const response = () => {
  const res = {};
  for (const method of ["cookie", "status", "send", "redirect"]) res[method] = jest.fn().mockReturnValue(res);
  return res;
};
beforeEach(() => {
  process.env.ACCESS_TOKEN_PRIVATE_KEY = "access-test-only";
  process.env.REFRESH_TOKEN_PRIVATE_KEY = "refresh-test-only";
});
test("registration starts onboarding and ignores supplied role and completion flag", async () => {
  hashPassword.mockResolvedValue("hashed");
  const saved = { _id: new mongoose.Types.ObjectId(), name: "New", email: "new@example.com", role: "volunteer" };
  const create = jest.spyOn(User, "create").mockResolvedValue(saved);
  jest.spyOn(UserToken.prototype, "save").mockResolvedValue({});
  const res = response(), next = jest.fn();
  await register({ body: { name: "New", email: "new@example.com", password: "test", provider: { name: "credentials" },
    role: "admin", roleSelectionPending: false } }, res, next);
  expect(next).not.toHaveBeenCalled();
  expect(create.mock.calls[0][0]).toEqual(expect.objectContaining({ roleSelectionPending: true }));
  expect(create.mock.calls[0][0].role).toBeUndefined();
  expect(res.status).toHaveBeenCalledWith(201);
});
test("missing refresh cookie is rejected before querying tokens", async () => {
  const find = jest.spyOn(UserToken, "findOne");
  const next = jest.fn();
  await refreshToken({ cookies: {} }, response(), next);
  expect(find).not.toHaveBeenCalled(); expect(next.mock.calls[0][0].status).toBe(401);
});
test.each(["expired", "wrong-user", "invalid-signature"])("refresh rejects %s without issuing access", async kind => {
  const id = new mongoose.Types.ObjectId();
  const token = jwt.sign({ _id: kind === "wrong-user" ? String(new mongoose.Types.ObjectId()) : String(id) },
    kind === "invalid-signature" ? "wrong-secret" : process.env.REFRESH_TOKEN_PRIVATE_KEY,
    { expiresIn: kind === "expired" ? -1 : 3600 });
  jest.spyOn(UserToken, "findOne").mockResolvedValue({ _id: new mongoose.Types.ObjectId(), userId: id, token });
  jest.spyOn(User, "findById").mockResolvedValue({ _id: id, role: "volunteer", email: "v@example.com" });
  jest.spyOn(UserToken, "deleteOne").mockResolvedValue({ deletedCount: 1 });
  const res = response(), next = jest.fn();
  await refreshToken({ cookies: { refresh_token: token } }, res, next);
  expect(next.mock.calls[0][0].status).toBe(403); expect(res.cookie).not.toHaveBeenCalled();
});
test("valid refresh uses the current database role", async () => {
  const id = new mongoose.Types.ObjectId();
  const token = jwt.sign({ _id: String(id), role: "volunteer" }, process.env.REFRESH_TOKEN_PRIVATE_KEY);
  jest.spyOn(UserToken, "findOne").mockResolvedValue({ userId: id, token });
  jest.spyOn(User, "findById").mockResolvedValue({ _id: id, role: "organization", email: "o@example.com" });
  const res = response(), next = jest.fn();
  await refreshToken({ cookies: { refresh_token: token } }, res, next);
  expect(next).not.toHaveBeenCalled();
  const access = res.cookie.mock.calls.find(([name]) => name === "access_token")[1];
  expect(jwt.verify(access, process.env.ACCESS_TOKEN_PRIVATE_KEY).role).toBe("organization");
});
test.each([true, false])("Google callback follows onboarding state %p", async pending => {
  jest.spyOn(User, "findOne").mockResolvedValue({ _id: new mongoose.Types.ObjectId(), email: "g@example.com",
    role: "volunteer", roleSelectionPending: pending });
  jest.spyOn(UserToken.prototype, "save").mockResolvedValue({});
  const res = response();
  await google({ user: { email: "g@example.com" } }, res, jest.fn());
  const url = new URL(res.redirect.mock.calls[0][0]);
  expect(url.pathname).toBe(pending ? "/role-selection" : "/");
});