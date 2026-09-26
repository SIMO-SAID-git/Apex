import { useQuery } from "@tanstack/react-query";
import { fetchProfileViewStats, fetchActivityStats } from "@/lib/api/dashboard-stats";
import { useUser } from "@/hooks/auth/use-user";

export function useProfileViewStats() {
  const { user, isLoading } = useUser();
  return useQuery({
    queryKey: ["profile-views", "stats"],
    queryFn: fetchProfileViewStats,
    enabled: Boolean(user) && !isLoading,
  });
}

export function useActivityStats() {
  const { user, isLoading } = useUser();
  return useQuery({
    queryKey: ["activity-stats"],
    queryFn: fetchActivityStats,
    enabled: Boolean(user) && !isLoading,
  });
}
