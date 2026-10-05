const {
  MATCH_EXPLANATION_FALLBACK,
  ensureMatchingReasons,
  getActiveInitiativesFilter,
} = require("../controllers/matching");

const { Initiative } = require("../models/Initiatives");

describe("US1.1 matched opportunities", () => {
  test("queries only active and legacy initiatives", () => {
    expect(getActiveInitiativesFilter()).toEqual({
      $or: [{ status: "active" }, { status: { $exists: false } }],
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
    const reasons = ["Matches your interests based on Ikigai categories"];

    expect(ensureMatchingReasons(reasons)).toBe(reasons);
  });

  test("returns a fallback explanation when reasons are empty", () => {
    expect(ensureMatchingReasons([])).toEqual([MATCH_EXPLANATION_FALLBACK]);
  });
});

const { scoreInitiative } = require("../controllers/matching");
const response = {
  totalScores: { passion: 4, mission: 0, profession: 0, vocation: 0 },
};
const oldRole = { createdAt: "2020-01-01", applicants: [] };
test("no evidence earns zero and does not invent a location match", () => {
  expect(scoreInitiative(response, oldRole)).toEqual({ score: 0, reasons: [] });
});
test("semantic matching does not mistake a substring for a skill", () => {
  expect(
    scoreInitiative(response, {
      ...oldRole,
      description: "Participate in a department",
    }).score
  ).toBe(0);
  expect(
    scoreInitiative(response, { ...oldRole, description: "Create art" }).score
  ).toBe(0.35);
});
test("reasons identify actual matching tags and scale remains out of ten", () => {
  const match = scoreInitiative(response, {
    ...oldRole,
    whatMovesThisInitiative: ["Creative expression"],
  });
  expect(match.score).toBe(1.15);
  expect(match.reasons[0]).toContain("Creative expression");
  expect(match.reasons.join(" ")).not.toMatch(/location|popular/i);
});
test("recency alone does not produce a personalised match explanation", () => {
  const match = scoreInitiative(response, {
    createdAt: new Date(),
    applicants: [],
  });
  expect(match.score).toBe(0.2);
  expect(ensureMatchingReasons(match.reasons)).toEqual([
    MATCH_EXPLANATION_FALLBACK,
  ]);
});
test("empty scores do not manufacture a strongest category", () => {
  expect(scoreInitiative({ totalScores: {} }, oldRole)).toEqual({
    score: 0,
    reasons: [],
  });
});