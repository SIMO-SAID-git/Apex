import { describe, it, expect } from "vitest";
import { deriveOccupancyStatus } from "@/types/occupancy";

describe("deriveOccupancyStatus", () => {
  it("classifies low percentages as quiet", () => {
    expect(deriveOccupancyStatus(10)).toBe("quiet");
    expect(deriveOccupancyStatus(39)).toBe("quiet");
  });

  it("classifies mid-range percentages as moderate", () => {
    expect(deriveOccupancyStatus(40)).toBe("moderate");
    expect(deriveOccupancyStatus(74)).toBe("moderate");
  });

  it("classifies high percentages as peak", () => {
    expect(deriveOccupancyStatus(75)).toBe("peak");
    expect(deriveOccupancyStatus(100)).toBe("peak");
  });
});
