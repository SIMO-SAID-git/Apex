export type InstructorSpecialty = "strength" | "hiit" | "cardio" | "zen";

export interface Instructor {
  id: string;
  name: string;
  bio: string;
  specialties: InstructorSpecialty[];
  avatarUrl: string;
  yearsExperience: number;
  certifications: string[];
}
