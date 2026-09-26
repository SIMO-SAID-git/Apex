import { apiRequest } from "@/lib/api/client";
import type { CreateSessionInput, TrainerSession } from "@/types/session";

export async function fetchMySessions(): Promise<TrainerSession[]> {
  const data = await apiRequest<{ sessions: TrainerSession[] }>("/api/trainer-sessions");
  return data.sessions;
}

export async function bookTrainerSession(input: CreateSessionInput): Promise<TrainerSession> {
  const data = await apiRequest<{ session: TrainerSession }>("/api/trainer-sessions", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.session;
}
