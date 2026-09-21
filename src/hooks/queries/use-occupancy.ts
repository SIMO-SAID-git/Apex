import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchOccupancy } from "@/lib/api/occupancy";
import { queryKeys } from "@/lib/api/query-keys";
import { useOccupancyRealtime } from "@/hooks/realtime/use-occupancy-realtime";
import type { Occupancy } from "@/types/occupancy";

/**
 * Polls /api/occupancy as the baseline data source, then layers a realtime
 * subscription on top that writes directly into the query cache. Components
 * consuming this hook never know whether an update came from a poll or a
 * push — they just re-render when the cache changes.
 */
export function useOccupancy() {
  const query = useQuery({
    queryKey: queryKeys.occupancy(),
    queryFn: fetchOccupancy,
    refetchInterval: 30_000,
  });

  const queryClient = useQueryClient();

  useOccupancyRealtime((payload: Occupancy) => {
    queryClient.setQueryData(queryKeys.occupancy(), payload);
  });

  useEffect(() => {
    // No-op effect kept for symmetry/clarity of the realtime wiring above.
  }, []);

  return query;
}
