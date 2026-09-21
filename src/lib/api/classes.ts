import { apiRequest } from "@/lib/api/client";
import type { FitnessClass } from "@/types/class";

export async function fetchClasses(date?: string): Promise<FitnessClass[]> {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  const data = await apiRequest<{ classes: FitnessClass[] }>(`/api/classes${query}`);
  return data.classes;
}
