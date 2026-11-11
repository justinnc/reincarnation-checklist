import { describe, expect, it } from "vitest";
import { allMilestones } from "@/lib/data";
import { EASY_QUIZ_IDS, inQuizPool } from "@/lib/quizPools";

describe("quiz pools", () => {
  it("easy pool ids are real milestones with a quiz, and fill at least one round", () => {
    const byId = new Map(allMilestones.map((m) => [m.id, m]));
    for (const id of EASY_QUIZ_IDS) expect(byId.get(id)?.quiz, id).toBeDefined();
    expect(new Set(EASY_QUIZ_IDS).size).toBe(EASY_QUIZ_IDS.length);
    expect(EASY_QUIZ_IDS.length).toBeGreaterThanOrEqual(10);
  });

  it("filters by all / easy / country", () => {
    const q = { id: "us-iphone-launch-2007", country: "us" };
    expect(inQuizPool(q, "all")).toBe(true);
    expect(inQuizPool(q, "easy")).toBe(true);
    expect(inQuizPool(q, "us")).toBe(true);
    expect(inQuizPool(q, "vn")).toBe(false);
    expect(inQuizPool({ id: "us-gold-bull-2001-2011", country: "us" }, "easy")).toBe(false);
  });
});
