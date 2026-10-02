const {
  MongoMemoryServer,
} = require("mongodb-memory-server");
const mongoose = require("mongoose");
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const request = require("supertest");

const { User } = require("../models/User");
const { users } = require("../routes/users");
const {
  hasRoles,
} = require("../middleware/jwt");

jest.setTimeout(120000);

let database;
let app;
let volunteer;
let organisation;
let admin;

const cookie = (
  user,
  role = user.role
) =>
  `access_token=${jwt.sign(
    {
      _id: String(user._id),
      role,
    },
    process.env.ACCESS_TOKEN_PRIVATE_KEY
  )}`;

const select = (
  role,
  user = volunteer
) =>
  request(app)
    .patch("/users/role")
    .set("Cookie", cookie(user))
    .send({ role });

const create = (name, role) =>
  User.create({
    name,
    role,
    email: `${name}@example.com`,
    password: "not-a-real-password",
    provider: {
      id: name,
      name: "credentials",
    },
    termsAndConditions: true,
  });

beforeAll(async () => {
  process.env.ACCESS_TOKEN_PRIVATE_KEY =
    "role-tests-only-secret";

  database = await MongoMemoryServer.create({
    binary: {
      version: "7.0.14",
    },
  });

  await mongoose.connect(database.getUri(), {
    dbName: "role_tests",
  });

  app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/users", users);

  app.get(
    "/organisation-only",
    hasRoles(["organization", "admin"]),
    (_req, res) =>
      res.json({ success: true })
  );

  app.use((error, _req, res, _next) =>
    res
      .status(error.status || 500)
      .json({ message: error.message })
  );
});

beforeEach(async () => {
  await User.deleteMany({});

  volunteer = await create(
    "volunteer",
    "volunteer"
  );

  organisation = await create(
    "organisation",
    "organization"
  );

  admin = await create(
    "administrator",
    "admin"
  );
});

afterAll(async () => {
  await mongoose.disconnect();

  if (database) {
    await database.stop();
  }
});

test(
  "organisation selection persists and old token gets current permissions",
  async () => {
    const oldCookie = cookie(volunteer);
    const saved = await select("organization");

    expect(saved.status).toBe(200);
    expect(saved.body.data.role)
      .toBe("organization");
    expect(saved.body.data.password)
      .toBeUndefined();

    expect(
      (await User.findById(volunteer._id)).role
    ).toBe("organization");

    const profile = await request(app)
      .post("/users/profile")
      .set("Cookie", oldCookie);

    expect(profile.body.data.role)
      .toBe("organization");

    const allowed = await request(app)
      .get("/organisation-only")
      .set("Cookie", oldCookie);

    expect(allowed.status).toBe(200);
  }
);

test(
  "volunteer selection persists and removes organisation permissions",
  async () => {
    const oldCookie = cookie(organisation);

    expect(
      (await select("volunteer", organisation))
        .status
    ).toBe(200);

    const denied = await request(app)
      .get("/organisation-only")
      .set("Cookie", oldCookie);

    expect(denied.status).toBe(403);
  }
);

test.each([
  "admin",
  "Admin",
  "organisation",
  "",
  null,
  1,
  { $ne: "volunteer" },
])(
  "rejects invalid or privileged selection %p",
  async (role) => {
    expect((await select(role)).status)
      .toBe(400);

    expect(
      (await User.findById(volunteer._id)).role
    ).toBe("volunteer");
  }
);

test(
  "role selection requires authentication",
  async () => {
    const result = await request(app)
      .patch("/users/role")
      .send({ role: "organization" });

    expect(result.status).toBe(401);
  }
);

test(
  "body identity cannot change another account",
  async () => {
    const saved = await request(app)
      .patch("/users/role")
      .set("Cookie", cookie(volunteer))
      .send({
        role: "organization",
        _id: admin._id,
        userId: admin._id,
      });

    expect(saved.status).toBe(200);

    expect(
      (await User.findById(admin._id)).role
    ).toBe("admin");

    expect(
      (await User.findById(volunteer._id)).role
    ).toBe("organization");
  }
);

test(
  "admin cannot be changed by public role selection",
  async () => {
    expect(
      (await select("volunteer", admin)).status
    ).toBe(403);

    expect(
      (await User.findById(admin._id)).role
    ).toBe("admin");
  }
);

test(
  "profile blocks admin promotion without saving other fields",
  async () => {
    const result = await request(app)
      .patch(`/users/${volunteer._id}`)
      .set("Cookie", cookie(volunteer))
      .send({
        name: "Changed",
        role: "admin",
      });

    expect(result.status).toBe(403);

    const saved = await User.findById(
      volunteer._id
    );

    expect(saved.role).toBe("volunteer");
    expect(saved.name).toBe("volunteer");
  }
);

test(
  "profile allows ordinary edits and ignores unapproved fields",
  async () => {
    const result = await request(app)
      .patch(`/users/${volunteer._id}`)
      .set("Cookie", cookie(volunteer))
      .send({
        name: "Richard",
        role: "volunteer",
        email: "attacker@example.com",
        password: "replacement",
        $set: { role: "admin" },
        "role.admin": true,
      });

    expect(result.status).toBe(200);
    expect(result.body.data.name)
      .toBe("Richard");
    expect(result.body.data.password)
      .toBeUndefined();

    const saved = await User.findById(
      volunteer._id
    );

    expect(saved.role).toBe("volunteer");
    expect(saved.email)
      .toBe("volunteer@example.com");
    expect(saved.password)
      .toBe("not-a-real-password");
  }
);

test(
  "profile cannot update another user",
  async () => {
    const result = await request(app)
      .patch(`/users/${admin._id}`)
      .set("Cookie", cookie(volunteer))
      .send({ name: "Changed" });

    expect(result.status).toBe(403);
  }
);

test(
  "forged admin claim in a valid token does not grant admin access",
  async () => {
    const result = await request(app)
      .get("/users")
      .set(
        "Cookie",
        cookie(volunteer, "admin")
      );

    expect(result.status).toBe(403);
  }
);

test(
  "real admin access is granted using the current database role",
  async () => {
    const result = await request(app)
      .get("/users")
      .set(
        "Cookie",
        cookie(admin, "volunteer")
      );

    expect(result.status).toBe(200);

    expect(
      result.body.data.every(
        (user) => user.password === undefined
      )
    ).toBe(true);
  }
);

test(
  "revoked admin permission takes effect with the old token",
  async () => {
    const oldCookie = cookie(admin);

    await User.updateOne(
      { _id: admin._id },
      { $set: { role: "volunteer" } }
    );

    const result = await request(app)
      .get("/users")
      .set("Cookie", oldCookie);

    expect(result.status).toBe(403);
  }
);

test(
  "deleted accounts and invalid tokens cannot authenticate",
  async () => {
    const oldCookie = cookie(volunteer);

    await User.deleteOne({
      _id: volunteer._id,
    });

    const deleted = await request(app)
      .post("/users/profile")
      .set("Cookie", oldCookie);

    expect(deleted.status).toBe(401);

    const invalid = await request(app)
      .post("/users/profile")
      .set("Cookie", "access_token=invalid");

    expect(invalid.status).toBe(403);
  }
);