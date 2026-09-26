import { describe, it, expect } from "vitest";
import { MEMBERSHIP_TIERS, getTierConfig, canBookClasses, canViewRoster } from "@/config/membership";

describe("membership config", () => {
  it("has the exact required pricing", () => {
    expect(getTierConfig("foundation").priceLabel).toBe("$49.90/mo");
    expect(getTierConfig("performance").priceLabel).toBe("$149.00/mo");
    expect(getTierConfig("elite").priceLabel).toBe("$199.00/mo");
  });

  it("ranks tiers in ascending order of access", () => {
    const ranks = MEMBERSHIP_TIERS.map((t) => t.rank);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it("free tier cannot book classes or view rosters", () => {
    expect(canBookClasses("free")).toBe(false);
    expect(canViewRoster("free")).toBe(false);
  });

  it("every paid tier can book classes and view rosters", () => {
    for (const tier of ["foundation", "performance", "elite"]) {
      expect(canBookClasses(tier)).toBe(true);
      expect(canViewRoster(tier)).toBe(true);
    }
  });

  it("falls back to the first tier for an unknown id", () => {
    expect(getTierConfig("not-a-real-tier").id).toBe(MEMBERSHIP_TIERS[0]!.id);
  });
});
