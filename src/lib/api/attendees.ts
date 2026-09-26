import { apiRequest } from "@/lib/api/client";

export interface AttendeeSummary {
  displayName: string;
  status: "confirmed" | "waitlisted" | "cancelled";
}

export async function fetchClassAttendees(classId: string): Promise<AttendeeSummary[]> {
  const data = await apiRequest<{ attendees: AttendeeSummary[] }>(`/api/classes/${classId}/attendees`);
  return data.attendees;
}
