"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMembershipHistory, changeMembershipTier } from "@/lib/api/membership";
import { PROFILE_QUERY_KEY } from "@/hooks/auth/use-profile";
import { useUser } from "@/hooks/auth/use-user";

export function useMembershipHistory() {
  const { user, isLoading } = useUser();
  return useQuery({
    queryKey: ["membership", "history"],
    queryFn: fetchMembershipHistory,
    enabled: Boolean(user) && !isLoading,
  });
}

export function useChangeMembershipTier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changeMembershipTier,
    onSuccess: ({ profile }) => {
      if (profile) queryClient.setQueryData(PROFILE_QUERY_KEY, profile);
      queryClient.invalidateQueries({ queryKey: ["membership", "history"] });
    },
  });
}
