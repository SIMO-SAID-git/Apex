export type FitnessGoal =
  | "build-strength"
  | "lose-fat"
  | "improve-conditioning"
  | "mobility-recovery"
  | "general-fitness";

export interface CustomerProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  fitnessGoal: FitnessGoal | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string | null;
  fitnessGoal?: FitnessGoal | null;
}
