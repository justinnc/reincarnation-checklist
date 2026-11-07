import { describe, expect, it } from "vitest";
import { mulberry32, hashSeed, weightedPick } from "../rng";

describe("mulberry32", () => {
  it("is deterministic for the same seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it("produces different sequences for different seeds", () => {
    const a = mulberry32(1)();
    const b = mulberry32(2)();
    expect(a).not.toBe(b);
  });

  it("stays within [0, 1)", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("hashSeed", () => {
  it("is deterministic", () => {
    expect(hashSeed("20261107")).toBe(hashSeed("20261107"));
  });
  it("differs for different strings", () => {
    expect(hashSeed("20261107")).not.toBe(hashSeed("20261108"));
  });
});

describe("weightedPick", () => {
  it("picks the only item when there is one", () => {
    const items = [{ id: "a", weight: 1 }];
    expect(weightedPick(items, 0.5)?.id).toBe("a");
  });
  it("respects weight proportions at the boundaries", () => {
    const items = [
      { id: "a", weight: 1 },
      { id: "b", weight: 3 },
    ];
    expect(weightedPick(items, 0)?.id).toBe("a");
    expect(weightedPick(items, 0.99)?.id).toBe("b");
  });
  it("returns undefined for an empty list", () => {
    expect(weightedPick([], 0.5)).toBeUndefined();
  });
});
