import { describe, it, expect } from "vitest";
import { filterClasses } from "@/lib/utils/class-filters";
import { mockClasses } from "@/data/mock-classes";

describe("filterClasses", () => {
  it("returns all classes when no filters are active", () => {
    const result = filterClasses(mockClasses, { categories: [], intensities: [], instructorIds: [] });
    expect(result).toHaveLength(mockClasses.length);
  });

  it("filters by a single category", () => {
    const result = filterClasses(mockClasses, { categories: ["zen"], intensities: [], instructorIds: [] });
    expect(result.every((c) => c.category === "zen")).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("filters by multiple categories (OR semantics within the same facet)", () => {
    const result = filterClasses(mockClasses, { categories: ["strength", "hiit"], intensities: [], instructorIds: [] });
    expect(result.every((c) => c.category === "strength" || c.category === "hiit")).toBe(true);
  });

  it("combines category and intensity filters with AND semantics across facets", () => {
    const result = filterClasses(mockClasses, { categories: ["strength"], intensities: ["high"], instructorIds: [] });
    expect(result.every((c) => c.category === "strength" && c.intensity === "high")).toBe(true);
  });

  it("filters by instructor", () => {
    const instructorId = mockClasses[0]!.instructorId;
    const result = filterClasses(mockClasses, { categories: [], intensities: [], instructorIds: [instructorId] });
    expect(result.every((c) => c.instructorId === instructorId)).toBe(true);
  });

  it("returns an empty array when no class matches all active filters", () => {
    const result = filterClasses(mockClasses, {
      categories: ["zen"],
      intensities: ["high"],
      instructorIds: [],
    });
    expect(result).toHaveLength(0);
  });
});
