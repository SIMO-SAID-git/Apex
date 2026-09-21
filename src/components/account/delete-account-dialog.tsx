"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useAuthActions } from "@/hooks/auth/use-auth-actions";
import { ApiError } from "@/lib/api/client";

const CONFIRM_PHRASE = "Delete my account";

export function DeleteAccountDialog() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canConfirm = confirmText.trim() === CONFIRM_PHRASE;

  async function handleDelete() {
    if (!canConfirm) return;
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/account", { method: "DELETE" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new ApiError(body?.error ?? "Unable to delete your account.", response.status);
      }
      setIsOpen(false);
      await signOut();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete your account right now.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Button variant="outline" className="border-status-peak/40 text-status-peak hover:bg-status-peak/10" onClick={() => setIsOpen(true)}>
        Delete account
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Delete your account">
        <div className="space-y-4">
          <div className="flex gap-3 rounded-xl bg-status-peak/10 border border-status-peak/20 p-4">
            <AlertTriangle className="h-5 w-5 text-status-peak shrink-0 mt-0.5" />
            <p className="text-sm text-white/70">
              This permanently deletes your account, cancels all of your upcoming bookings, and removes your
              profile. This cannot be undone.
            </p>
          </div>

          <div>
            <Label htmlFor="delete-confirm">
              Type <span className="font-mono text-white">{CONFIRM_PHRASE}</span> to confirm
            </Label>
            <Input
              id="delete-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-status-peak">
              {error}
            </p>
          ) : null}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setIsOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-status-peak text-white hover:bg-status-peak/90"
              onClick={handleDelete}
              disabled={!canConfirm}
              isLoading={isDeleting}
            >
              Delete my account
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
