import { z } from "zod";

// A deliberately readable strong-password policy: 8+ chars, at least one
// uppercase, one lowercase, one number. Documented in the UI's strength
// indicator rather than hidden in a single opaque regex.
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[0-9]/, "Password must include a number.");

export const emailSchema = z.string().trim().min(1, "Email is required.").email("Enter a valid email address.");

const nameSchema = (label: string) =>
  z.string().trim().min(1, `${label} is required.`).max(60, `${label} must be under 60 characters.`);

export const fitnessGoalSchema = z
  .enum(["build-strength", "lose-fat", "improve-conditioning", "mobility-recovery", "general-fitness"])
  .nullable()
  .optional();

export const registerSchema = z
  .object({
    firstName: nameSchema("First name"),
    lastName: nameSchema("Last name"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
    phone: z.string().trim().max(20).optional().or(z.literal("")),
    dateOfBirth: z.string().optional().or(z.literal("")),
    fitnessGoal: fitnessGoalSchema,
    role: z.enum(["member", "trainer"]).default("member"),
    acceptedTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms to create an account." }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;

// Server-side re-validation (section 5: "never rely exclusively on
// client-side validation"). Excludes confirmPassword/acceptedTerms, which
// are purely client-side UX concerns re-checked at the form layer.
export const registerServerSchema = z.object({
  firstName: nameSchema("First name"),
  lastName: nameSchema("Last name"),
  email: emailSchema,
  password: passwordSchema,
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  fitnessGoal: fitnessGoalSchema,
  role: z.enum(["member", "trainer"]).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
