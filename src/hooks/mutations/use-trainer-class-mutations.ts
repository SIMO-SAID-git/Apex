import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTaughtClass, updateTaughtClass, cancelTaughtClass, publishTaughtClass } from "@/lib/api/trainer-classes";
import { MY_TAUGHT_CLASSES_KEY } from "@/hooks/queries/use-my-taught-classes";
import type { CreateClassSchema, UpdateClassSchema } from "@/lib/validations/class-schema";

function useInvalidateTaughtClasses() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: MY_TAUGHT_CLASSES_KEY });
    queryClient.invalidateQueries({ queryKey: ["classes"] });
  };
}

export function useCreateClass() {
  const invalidate = useInvalidateTaughtClasses();
  return useMutation({
    mutationFn: (input: CreateClassSchema) => createTaughtClass(input),
    onSuccess: invalidate,
  });
}

export function useUpdateClass() {
  const invalidate = useInvalidateTaughtClasses();
  return useMutation({
    mutationFn: ({ classId, input }: { classId: string; input: UpdateClassSchema }) => updateTaughtClass(classId, input),
    onSuccess: invalidate,
  });
}

export function useCancelClass() {
  const invalidate = useInvalidateTaughtClasses();
  return useMutation({
    mutationFn: (classId: string) => cancelTaughtClass(classId),
    onSuccess: invalidate,
  });
}

export function usePublishClass() {
  const invalidate = useInvalidateTaughtClasses();
  return useMutation({
    mutationFn: (classId: string) => publishTaughtClass(classId),
    onSuccess: invalidate,
  });
}
