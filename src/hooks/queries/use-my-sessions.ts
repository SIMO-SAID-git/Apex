import { useQuery } from "@tanstack/react-query";
import { fetchMySessions } from "@/lib/api/trainer-sessions";
import { useUser } from "@/hooks/auth/use-user";

export function useMySessions() {
  const { user, isLoading } = useUser();
  return useQuery({
    queryKey: ["trainer-sessions", "mine"],
    queryFn: fetchMySessions,
    enabled: Boolean(user) && !isLoading,
  });
}
