jest.mock("../service/upload", () => ({ uploadBusiness: jest.fn() }));
const { Initiative } = require("../models/Initiatives");
const {
  getOwnedInitiatives,
  create,
  getAll,
} = require("../controllers/initiatives");
const ownerId = "64b7f2f31f7c2f4b2f17a111";
const otherId = "64b7f2f31f7c2f4b2f17a112";
function response() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
    setHeader: jest.fn(),
  };
}
test("owned query uses only session identity and excludes applicants", async () => {
  const query = {
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockResolvedValue([]),
  };
  const find = jest.spyOn(Initiative, "find").mockReturnValue(query);
  const res = response();
  const next = jest.fn();
  await getOwnedInitiatives(
    { user: { _id: ownerId }, query: { userId: otherId } },
    res,
    next
  );
  expect(find).toHaveBeenCalledWith({ userId: ownerId });
  expect(query.select.mock.calls[0][0]).not.toContain("applicants");
  expect(res.setHeader).toHaveBeenCalledWith(
    "Cache-Control",
    "private, no-store"
  );
  expect(res.json).toHaveBeenCalledWith({ success: true, data: [] });
  expect(next).not.toHaveBeenCalled();
});
test("missing identity rejects before querying owned records", async () => {
  const find = jest.spyOn(Initiative, "find");
  const next = jest.fn();
  await getOwnedInitiatives({ query: {} }, response(), next);
  expect(next.mock.calls[0][0].status).toBe(401);
  expect(find).not.toHaveBeenCalled();
});
test("owned query failure is not a successful empty list", async () => {
  jest
    .spyOn(Initiative, "find")
    .mockReturnValue({
      select: () => ({ sort: () => Promise.reject(new Error("offline")) }),
    });
  const next = jest.fn();
  const res = response();
  await getOwnedInitiatives({ user: { _id: ownerId } }, res, next);
  expect(next.mock.calls[0][0].message).toBe("offline");
  expect(res.json).not.toHaveBeenCalled();
});
test.each([false, true])(
  "creation parses JSON/multipart and locks ownership (multipart=%s)",
  async (multipart) => {
    let saved;
    jest
      .spyOn(Initiative.prototype, "save")
      .mockImplementation(async function () {
        saved = this.toObject();
        return this;
      });
    jest.spyOn(Initiative, "findById").mockImplementation(async () => saved);
    const res = response();
    const next = jest.fn();
    const fields = {
      servicesNeeded: ["Teaching"],
      location: { city: "Chicago", country: "US" },
      goals: [],
    };
    const body = {
      initiativeName: "Mentor",
      description: "Teach coding",
      userId: otherId,
      applicants: [otherId],
      startTime: "2026-10-01T10:00:00Z",
      eventTimeFrame: "Weekly",
      eventType: "Remote",
    };
    for (const [key, value] of Object.entries(fields))
      body[key] = multipart ? JSON.stringify(value) : value;
    await create({ user: { _id: ownerId }, body }, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(String(saved.userId)).toBe(ownerId);
    expect(saved.applicants).toEqual([]);
    expect(saved.image).toEqual([]);
    expect(saved.location.city).toBe("Chicago");
    expect(saved.servicesNeeded).toEqual(["Teaching"]);
    expect(saved.startTime.toISOString()).toBe("2026-10-01T10:00:00.000Z");
    expect(saved.eventItemFrame).toBe("Weekly");
    expect(saved.eventItemType).toBe("Remote");
    expect(res.status).toHaveBeenCalledWith(201);
  }
);
test("invalid multipart data does not save", async () => {
  const save = jest.spyOn(Initiative.prototype, "save");
  const next = jest.fn();
  await create(
    { user: { _id: ownerId }, body: { servicesNeeded: "[bad" } },
    response(),
    next
  );
  expect(next.mock.calls[0][0].status).toBe(400);
  expect(save).not.toHaveBeenCalled();
});
test("city and country filters use dot paths and literal user input", async () => {
  const find = jest.spyOn(Initiative, "find").mockResolvedValue([]);
  await getAll(
    { query: { city: "New (York)", country: "US", search: "[Mentor]" } },
    response(),
    jest.fn()
  );
  const filter = find.mock.calls[0][0];
  expect(filter.$and[0]).toEqual({
    "location.country": { $regex: "US", $options: "i" },
  });
  expect(filter.$and[1]).toEqual({
    "location.city": { $regex: "New \\(York\\)", $options: "i" },
  });
  expect(filter.$and[2].$or[0]).toEqual({
    initiativeName: { $regex: "\\[Mentor\\]", $options: "i" },
  });
});