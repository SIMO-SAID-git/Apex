"use client";

import { useSession } from "@/hooks/auth/use-session";

export function useUser() {
  const { data: session, isLoading } = useSession();
  return { user: session?.user ?? null, isLoading };
}
