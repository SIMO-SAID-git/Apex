import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBooking } from "@/lib/api/bookings";
import { queryKeys } from "@/lib/api/query-keys";
import type { FitnessClass } from "@/types/class";

interface CreateBookingVariables {
  classId: string;
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBookingVariables) => createBooking(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["classes"] });
      const previous = queryClient.getQueriesData<FitnessClass[]>({ queryKey: ["classes"] });

      // Optimistically bump bookedCount so the UI reflects the change
      // immediately; the server response reconciles the real state after.
      previous.forEach(([key, classes]) => {
        if (!classes) return;
        queryClient.setQueryData<FitnessClass[]>(
          key,
          classes.map((c) =>
            c.id === input.classId ? { ...c, bookedCount: c.bookedCount + 1 } : c
          )
        );
      });

      return { previous };
    },
    onError: (_err, _input, context) => {
      context?.previous.forEach(([key, classes]) => {
        queryClient.setQueryData(key, classes);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
