"use client";

import { LogOut } from "lucide-react";
import { useAuthActions } from "@/hooks/auth/use-auth-actions";
import { Button } from "@/components/ui/button";

export function LogoutButton({ variant = "outline" as const, className }: { variant?: "outline" | "ghost" | "primary" | "secondary"; className?: string }) {
  const { signOut, isPending } = useAuthActions();

  return (
    <Button variant={variant} onClick={() => signOut()} isLoading={isPending} className={className}>
      <LogOut className="h-4 w-4" />
      Log out
    </Button>
  );
}
