import { useQuery } from "@tanstack/react-query";
import { fetchMyBookings } from "@/lib/api/bookings";
import { useUser } from "@/hooks/auth/use-user";

const MY_BOOKINGS_QUERY_KEY = ["bookings", "me"] as const;

/** Enabled only once we know a customer is signed in — avoids a guaranteed 401 flash on mount. */
export function useMyBookings() {
  const { user, isLoading: isLoadingUser } = useUser();

  return useQuery({
    queryKey: MY_BOOKINGS_QUERY_KEY,
    queryFn: fetchMyBookings,
    enabled: Boolean(user) && !isLoadingUser,
  });
}

export { MY_BOOKINGS_QUERY_KEY };
