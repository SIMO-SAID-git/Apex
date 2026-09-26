import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookTrainerSession } from "@/lib/api/trainer-sessions";

export function useBookSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookTrainerSession,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trainer-sessions"] }),
  });
}
