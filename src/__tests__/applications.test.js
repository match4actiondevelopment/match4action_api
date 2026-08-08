jest.mock("../models/Initiatives", () => ({
  Initiative: {
    findOneAndUpdate: jest.fn(),
    findById: jest.fn(),
  },
}));

const { apply } = require("../controllers/initiatives");
const { Initiative } = require("../models/Initiatives");

const activeInitiativeId = "64b7f2f31f7c2f4b2f17a111";
const volunteerId = "64b7f2f31f7c2f4b2f17a222";

const createResponse = () => {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  };

  response.status.mockReturnValue(response);
  return response;
};

describe("US2 apply to an initiative", () => {
  test("adds the authenticated volunteer to an active initiative", async () => {
    Initiative.findOneAndUpdate.mockResolvedValue({
      _id: activeInitiativeId,
    });

    const request = {
      params: { id: activeInitiativeId },
      user: { _id: volunteerId },
    };
    const response = createResponse();
    const next = jest.fn();

    await apply(request, response, next);

    expect(Initiative.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: [
          { status: "active" },
          { status: { $exists: false } },
        ],
      }),
      { $addToSet: { applicants: volunteerId } },
      expect.objectContaining({
        returnOriginal: false,
        runValidators: true,
      })
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Application submitted successfully.",
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects an inactive or closed initiative", async () => {
    Initiative.findOneAndUpdate.mockResolvedValue(null);
    Initiative.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ status: "inactive" }),
    });

    const request = {
      params: { id: activeInitiativeId },
      user: { _id: volunteerId },
    };
    const response = createResponse();
    const next = jest.fn();

    await apply(request, response, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 409,
        message: "This initiative is not accepting applications.",
      })
    );
    expect(response.status).not.toHaveBeenCalled();
  });

  test("returns not found when the initiative does not exist", async () => {
    Initiative.findOneAndUpdate.mockResolvedValue(null);
    Initiative.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    const request = {
      params: { id: activeInitiativeId },
      user: { _id: volunteerId },
    };
    const response = createResponse();
    const next = jest.fn();

    await apply(request, response, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 404,
        message: "Initiative not found.",
      })
    );
  });

  test("rejects a malformed initiative id before querying", async () => {
    const request = {
      params: { id: "not-an-object-id" },
      user: { _id: volunteerId },
    };
    const response = createResponse();
    const next = jest.fn();

    await apply(request, response, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        message: "Invalid initiative id.",
      })
    );
    expect(Initiative.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test("requires an authenticated user", async () => {
    const request = {
      params: { id: activeInitiativeId },
      user: null,
    };
    const response = createResponse();
    const next = jest.fn();

    await apply(request, response, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 401,
        message: "Authentication is required to apply.",
      })
    );
    expect(Initiative.findOneAndUpdate).not.toHaveBeenCalled();
  });
});