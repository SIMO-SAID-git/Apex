export type TrainerSessionStatus = "confirmed" | "cancelled" | "completed";

export interface TrainerSession {
  id: string;
  trainerUserId: string;
  memberUserId: string;
  scheduledAt: string; // ISO datetime
  durationMinutes: number;
  status: TrainerSessionStatus;
  createdAt: string;
}

export interface CreateSessionInput {
  trainerUsername: string;
  scheduledAt: string;
  durationMinutes?: number;
}
