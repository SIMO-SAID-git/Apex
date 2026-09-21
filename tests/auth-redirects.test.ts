import { describe, it, expect } from "vitest";
import { sanitizeRedirectTarget, buildLoginRedirectUrl, appendClassIdParam } from "@/lib/auth/auth-redirects";

describe("sanitizeRedirectTarget", () => {
  it("allows a normal relative path", () => {
    expect(sanitizeRedirectTarget("/dashboard/schedule")).toBe("/dashboard/schedule");
  });

  it("falls back to /dashboard when the target is missing", () => {
    expect(sanitizeRedirectTarget(null)).toBe("/dashboard");
    expect(sanitizeRedirectTarget(undefined)).toBe("/dashboard");
  });

  it("rejects an absolute external URL (prevents open redirect)", () => {
    expect(sanitizeRedirectTarget("https://evil.example.com")).toBe("/dashboard");
  });

  it("rejects a protocol-relative URL", () => {
    expect(sanitizeRedirectTarget("//evil.example.com")).toBe("/dashboard");
  });

  it("rejects a path with no leading slash", () => {
    expect(sanitizeRedirectTarget("evil.example.com")).toBe("/dashboard");
  });
});

describe("buildLoginRedirectUrl", () => {
  it("encodes the redirect target and extra params", () => {
    const url = buildLoginRedirectUrl("/dashboard/schedule", { classId: "cls-01" });
    expect(url).toContain("redirect=%2Fdashboard%2Fschedule");
    expect(url).toContain("classId=cls-01");
  });

  it("omits empty extra params", () => {
    const url = buildLoginRedirectUrl("/dashboard/schedule", { classId: "" });
    expect(url).not.toContain("classId");
  });
});

describe("appendClassIdParam", () => {
  it("appends with ? when the target has no existing query", () => {
    expect(appendClassIdParam("/dashboard/schedule", "cls-01")).toBe("/dashboard/schedule?classId=cls-01");
  });

  it("appends with & when the target already has a query", () => {
    expect(appendClassIdParam("/dashboard/schedule?day=wed", "cls-01")).toBe("/dashboard/schedule?day=wed&classId=cls-01");
  });

  it("returns the target unchanged when there is no classId", () => {
    expect(appendClassIdParam("/dashboard/schedule", null)).toBe("/dashboard/schedule");
  });
});
