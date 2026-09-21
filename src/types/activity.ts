export type ActivityEventType = "booking" | "milestone" | "checkin";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  message: string;
  memberInitial: string;
  timestamp: string;
}
