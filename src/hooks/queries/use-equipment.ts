import { useQuery } from "@tanstack/react-query";
import { fetchFacilityData } from "@/lib/api/equipment";
import { queryKeys } from "@/lib/api/query-keys";

export function useEquipment() {
  return useQuery({
    queryKey: queryKeys.equipment(),
    queryFn: fetchFacilityData,
    staleTime: 5 * 60_000,
  });
}
