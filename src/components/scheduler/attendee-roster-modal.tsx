"use client";

import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { fetchClassAttendees } from "@/lib/api/attendees";

export function AttendeeRosterModal({
  isOpen,
  onClose,
  classId,
  classTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  classTitle: string;
}) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["attendees", classId],
    queryFn: () => fetchClassAttendees(classId),
    enabled: isOpen,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Attendees — ${classTitle}`}>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message="We couldn't load the attendee list." onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No one booked yet" description="Attendees will show up here as members book this class." icon={Users} />
      ) : (
        <ul className="space-y-2 max-h-80 overflow-y-auto">
          {data.map((attendee, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2.5">
              <span className="text-sm text-white/80">{attendee.displayName}</span>
              <Badge tone={attendee.status === "confirmed" ? "success" : "warning"}>{attendee.status}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
