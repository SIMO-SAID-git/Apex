import { useQuery } from "@tanstack/react-query";
import { fetchInstructors } from "@/lib/api/instructors";
import { queryKeys } from "@/lib/api/query-keys";

export function useInstructors() {
  return useQuery({
    queryKey: queryKeys.instructors(),
    queryFn: fetchInstructors,
    staleTime: 5 * 60_000,
  });
}
