import { describe, it, expect } from "vitest";
import { mapAuthError, friendlyAuthMessage } from "@/lib/auth/auth-errors";

describe("mapAuthError", () => {
  it("maps Supabase's invalid credentials message", () => {
    const result = mapAuthError(new Error("Invalid login credentials"));
    expect(result.code).toBe("INVALID_CREDENTIALS");
    expect(result.message).toBe(friendlyAuthMessage("INVALID_CREDENTIALS"));
  });

  it("maps a duplicate-registration message", () => {
    const result = mapAuthError(new Error("User already registered"));
    expect(result.code).toBe("EMAIL_ALREADY_REGISTERED");
  });

  it("maps our own stable error codes directly", () => {
    const result = mapAuthError(new Error("UNAUTHENTICATED"));
    expect(result.code).toBe("UNAUTHENTICATED");
  });

  it("maps unrecognized errors to UNKNOWN without leaking internals", () => {
    const result = mapAuthError(new Error("relation \"foo\" does not exist at line 42"));
    expect(result.code).toBe("UNKNOWN");
    expect(result.message).not.toContain("relation");
  });

  it("passes through an existing AuthError unchanged", () => {
    const original = mapAuthError(new Error("EMAIL_NOT_VERIFIED"));
    expect(mapAuthError(original)).toBe(original);
  });

  it("never includes the word 'supabase' or 'postgres' in a friendly message", () => {
    const codes = ["INVALID_CREDENTIALS", "EMAIL_ALREADY_REGISTERED", "UNKNOWN"] as const;
    for (const code of codes) {
      const message = friendlyAuthMessage(code).toLowerCase();
      expect(message).not.toContain("supabase");
      expect(message).not.toContain("postgres");
    }
  });
});
