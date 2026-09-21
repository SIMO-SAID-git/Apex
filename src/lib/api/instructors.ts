import { apiRequest } from "@/lib/api/client";
import type { Instructor } from "@/types/instructor";

export async function fetchInstructors(): Promise<Instructor[]> {
  const data = await apiRequest<{ instructors: Instructor[] }>("/api/instructors");
  return data.instructors;
}
