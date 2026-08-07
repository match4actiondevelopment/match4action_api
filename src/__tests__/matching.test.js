const {
  MATCH_EXPLANATION_FALLBACK,
  ensureMatchingReasons,
  getActiveInitiativesFilter,
} = require("../controllers/matching");

const { Initiative } = require("../models/Initiatives");

describe("US1.1 matched opportunities", () => {
  test("queries only active and legacy initiatives", () => {
    expect(getActiveInitiativesFilter()).toEqual({
      $or: [
        { status: "active" },
        { status: { $exists: false } },
      ],
    });
  });

  test("defaults new initiatives to active", () => {
    const initiative = new Initiative({
      initiativeName: "Community mentor",
      description: "Support local learners",
      userId: "64b7f2f31f7c2f4b2f17a111",
    });

    expect(initiative.status).toBe("active");
  });

  test("preserves existing matching reasons", () => {
    const reasons = [
      "Matches your interests based on Ikigai categories",
    ];

    expect(ensureMatchingReasons(reasons)).toBe(reasons);
  });

  test("returns a fallback explanation when reasons are empty", () => {
    expect(ensureMatchingReasons([])).toEqual([
      MATCH_EXPLANATION_FALLBACK,
    ]);
  });
});
