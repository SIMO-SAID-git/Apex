import { describe, it, expect } from "vitest";
import { deriveClassStatus, classStatusLabel } from "@/types/class";

describe("deriveClassStatus", () => {
  it("is available when well below capacity", () => {
    const status = deriveClassStatus({ capacity: 20, bookedCount: 5, waitlistCount: 0, waitlistCapacity: 5 });
    expect(status).toBe("available");
  });

  it("is limited when close to capacity", () => {
    const status = deriveClassStatus({ capacity: 20, bookedCount: 19, waitlistCount: 0, waitlistCapacity: 5 });
    expect(status).toBe("limited");
  });

  it("is waitlist when full but waitlist has room", () => {
    const status = deriveClassStatus({ capacity: 20, bookedCount: 20, waitlistCount: 2, waitlistCapacity: 5 });
    expect(status).toBe("waitlist");
  });

  it("is full when both class and waitlist are at capacity", () => {
    const status = deriveClassStatus({ capacity: 20, bookedCount: 20, waitlistCount: 5, waitlistCapacity: 5 });
    expect(status).toBe("full");
  });
});

describe("classStatusLabel", () => {
  it("shows exact spot count when only one spot is left", () => {
    expect(classStatusLabel("limited", 1)).toBe("1 Spot Left");
  });

  it("shows Waitlist Full for a full class+waitlist", () => {
    expect(classStatusLabel("full", 0)).toBe("Waitlist Full");
  });
});
