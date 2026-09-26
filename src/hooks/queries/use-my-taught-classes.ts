import { useQuery } from "@tanstack/react-query";
import { fetchMyTaughtClasses } from "@/lib/api/trainer-classes";
import { useUser } from "@/hooks/auth/use-user";

export const MY_TAUGHT_CLASSES_KEY = ["classes", "taught-by-me"] as const;

export function useMyTaughtClasses() {
  const { user, isLoading } = useUser();
  return useQuery({
    queryKey: MY_TAUGHT_CLASSES_KEY,
    queryFn: fetchMyTaughtClasses,
    enabled: Boolean(user) && !isLoading,
  });
}
