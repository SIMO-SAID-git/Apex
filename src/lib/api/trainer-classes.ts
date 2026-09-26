import { apiRequest } from "@/lib/api/client";
import type { FitnessClass } from "@/types/class";
import type { CreateClassSchema, UpdateClassSchema } from "@/lib/validations/class-schema";

export async function fetchMyTaughtClasses(): Promise<FitnessClass[]> {
  const data = await apiRequest<{ classes: FitnessClass[] }>("/api/trainer/classes");
  return data.classes;
}

export async function createTaughtClass(input: CreateClassSchema): Promise<FitnessClass> {
  const data = await apiRequest<{ class: FitnessClass }>("/api/trainer/classes", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.class;
}

export async function updateTaughtClass(classId: string, input: UpdateClassSchema): Promise<FitnessClass> {
  const data = await apiRequest<{ class: FitnessClass }>(`/api/trainer/classes/${classId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return data.class;
}

export async function cancelTaughtClass(classId: string): Promise<void> {
  await apiRequest(`/api/trainer/classes/${classId}`, { method: "DELETE", parseJson: false });
}

export async function publishTaughtClass(classId: string): Promise<FitnessClass> {
  const data = await apiRequest<{ class: FitnessClass }>(`/api/trainer/classes/${classId}/publish`, {
    method: "POST",
  });
  return data.class;
}
