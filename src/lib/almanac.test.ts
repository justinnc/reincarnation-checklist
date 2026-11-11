import { describe, expect, it } from "vitest";
import { interpolateAlmanacValue } from "./almanac";
import vn from "@/data/almanac/vn.json";

describe("almanac snapshots", () => {
  it("does not backfill a 2000 Region-I wage from the first 2009 wage quote", () => {
    const wage = vn.find((item) => item.id === "vn-luong-toi-thieu-vung1");
    expect(wage).toBeDefined();
    expect(interpolateAlmanacValue(wage!.series, 2000)).toBeNull();
  });
  it("interpolates only between documented years and preserves exact points", () => {
    const series = [{ year: 2000, value: 100 }, { year: 2010, value: 400 }];
    expect(interpolateAlmanacValue(series, 1999)).toBeNull();
    expect(interpolateAlmanacValue(series, 2000)).toEqual({ value: 100, exact: true });
    expect(interpolateAlmanacValue(series, 2005)).toEqual({ value: 200, exact: false });
    expect(interpolateAlmanacValue(series, 2011)).toBeNull();
  });
});
