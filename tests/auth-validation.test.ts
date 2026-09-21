import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema, passwordSchema, resetPasswordSchema } from "@/lib/validations/auth-schema";

describe("passwordSchema", () => {
  it("rejects passwords under 8 characters", () => {
    expect(passwordSchema.safeParse("Ab1").success).toBe(false);
  });

  it("rejects passwords missing an uppercase letter", () => {
    expect(passwordSchema.safeParse("lowercase1").success).toBe(false);
  });

  it("rejects passwords missing a number", () => {
    expect(passwordSchema.safeParse("NoNumbersHere").success).toBe(false);
  });

  it("accepts a password meeting every rule", () => {
    expect(passwordSchema.safeParse("Str0ngPass").success).toBe(true);
  });
});

describe("registerSchema", () => {
  const validInput = {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    password: "Str0ngPass",
    confirmPassword: "Str0ngPass",
    acceptedTerms: true as const,
  };

  it("accepts a fully valid registration", () => {
    expect(registerSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({ ...validInput, confirmPassword: "Different1" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("confirmPassword"))).toBe(true);
    }
  });

  it("rejects when terms are not accepted", () => {
    const result = registerSchema.safeParse({ ...validInput, acceptedTerms: false });
    expect(result.success).toBe(false);
  });

  it("rejects a missing first name", () => {
    const result = registerSchema.safeParse({ ...validInput, firstName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({ ...validInput, email: "not-an-email" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires a non-empty password", () => {
    expect(loginSchema.safeParse({ email: "jane@example.com", password: "" }).success).toBe(false);
  });

  it("requires a valid email", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "whatever" }).success).toBe(false);
  });

  it("accepts valid credentials shape", () => {
    expect(loginSchema.safeParse({ email: "jane@example.com", password: "whatever" }).success).toBe(true);
  });
});

describe("resetPasswordSchema", () => {
  it("rejects mismatched confirmation", () => {
    const result = resetPasswordSchema.safeParse({ password: "Str0ngPass", confirmPassword: "Other1234" });
    expect(result.success).toBe(false);
  });

  it("accepts matching strong passwords", () => {
    const result = resetPasswordSchema.safeParse({ password: "Str0ngPass", confirmPassword: "Str0ngPass" });
    expect(result.success).toBe(true);
  });
});
