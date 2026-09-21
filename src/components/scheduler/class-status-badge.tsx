import type { ClassStatus } from "@/types/class";
import { classStatusLabel } from "@/types/class";
import { Badge } from "@/components/ui/badge";

const toneByStatus: Record<ClassStatus, "success" | "warning" | "danger" | "neutral"> = {
  available: "success",
  limited: "warning",
  waitlist: "warning",
  full: "danger",
};

export function ClassStatusBadge({
  status,
  capacity,
  bookedCount,
}: {
  status: ClassStatus;
  capacity: number;
  bookedCount: number;
}) {
  const spotsLeft = Math.max(0, capacity - bookedCount);
  return <Badge tone={toneByStatus[status]}>{classStatusLabel(status, spotsLeft)}</Badge>;
}
