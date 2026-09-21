import { useQuery } from "@tanstack/react-query";
import { fetchClasses } from "@/lib/api/classes";
import { queryKeys } from "@/lib/api/query-keys";

export function useClasses(date?: string) {
  return useQuery({
    queryKey: queryKeys.classes(date),
    queryFn: () => fetchClasses(date),
  });
}
