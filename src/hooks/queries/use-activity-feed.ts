import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchActivityFeed } from "@/lib/api/activity";
import { queryKeys } from "@/lib/api/query-keys";
import { useActivityRealtime } from "@/hooks/realtime/use-activity-realtime";
import type { ActivityEvent } from "@/types/activity";

export function useActivityFeed() {
  const query = useQuery({
    queryKey: queryKeys.activity(),
    queryFn: fetchActivityFeed,
  });

  const queryClient = useQueryClient();

  useActivityRealtime((event: ActivityEvent) => {
    queryClient.setQueryData<ActivityEvent[]>(queryKeys.activity(), (current) => {
      const existing = current ?? [];
      return [event, ...existing].slice(0, 20);
    });
  });

  return query;
}
