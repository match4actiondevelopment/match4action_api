jest.mock("../services/applications", () => ({
  createApplication: jest.fn(),
  listApplications: jest.fn(),
}));

const express = require("express");
const request = require("supertest");

const {
  apply,
  getMyApplications,
} = require("../controllers/applications");

const service = require("../services/applications");

const userId = "64b7f2f31f7c2f4b2f17a222";

function createTestApp(authenticated = true) {
  const app = express();

  app.use((req, res, next) => {
    if (authenticated) {
      req.user = { _id: userId };
    }

    next();
  });

  app.patch("/apply/:id", apply);
  app.get("/me", getMyApplications);

  app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
      message: error.message,
    });
  });

  return app;
}

test("apply uses authenticated identity and preserves the success contract", async () => {
  const data = {
    applicationId: "application-1",
    initiativeId: "role-1",
    applied: true,
    status: "applied",
  };

  service.createApplication.mockResolvedValue(data);

  const response = await request(createTestApp())
    .patch("/apply/role-1?userId=someone-else");

  expect(
    service.createApplication
  ).toHaveBeenCalledWith(userId, "role-1");

  expect(response.status).toBe(200);

  expect(response.body).toEqual({
    success: true,
    data,
    message: "Application submitted successfully.",
  });
});

test.each([400, 404, 409, 500])(
  "apply forwards status %s without reporting success",
  async (status) => {
    service.createApplication.mockRejectedValue(
      Object.assign(new Error("failed"), { status })
    );

    const response = await request(createTestApp())
      .patch("/apply/role-1");

    expect(response.status).toBe(status);

    expect(response.body).toEqual({
      message: "failed",
    });
  }
);

test("list uses authenticated identity and disables shared caching", async () => {
  service.listApplications.mockResolvedValue([
    { applicationId: "application-1" },
  ]);

  const response = await request(createTestApp())
    .get("/me?userId=someone-else");

  expect(
    service.listApplications
  ).toHaveBeenCalledWith(userId);

  expect(response.status).toBe(200);

  expect(response.headers["cache-control"])
    .toBe("private, no-store");

  expect(response.body.data).toEqual([
    { applicationId: "application-1" },
  ]);
});

test("empty application list is successful", async () => {
  service.listApplications.mockResolvedValue([]);

  const response = await request(createTestApp())
    .get("/me");

  expect(response.body).toEqual({
    success: true,
    data: [],
  });
});

test("list errors are surfaced instead of returning an empty success", async () => {
  service.listApplications.mockRejectedValue(
    new Error("database unavailable")
  );

  const response = await request(createTestApp())
    .get("/me");

  expect(response.status).toBe(500);
});

test("missing identity blocks both actions before service calls", async () => {
  const applyResponse = await request(
    createTestApp(false)
  ).patch("/apply/role-1");

  const listResponse = await request(
    createTestApp(false)
  ).get("/me");

  expect(applyResponse.status).toBe(401);
  expect(listResponse.status).toBe(401);

  expect(
    service.createApplication
  ).not.toHaveBeenCalled();

  expect(
    service.listApplications
  ).not.toHaveBeenCalled();
});