"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useChangeMembershipTier } from "@/hooks/auth/use-membership";
import { getTierConfig } from "@/config/membership";
import type { MembershipTier } from "@/types/membership";

interface ChangeTierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fromTier: MembershipTier;
  toTier: MembershipTier;
}

/**
 * Task #6: "clear UI explanations of what happens to active bookings,
 * remaining billing cycles, and access rights when switching tiers." Kept
 * generic/deterministic rather than querying live billing state, since this
 * app has no real payment provider wired in yet (see RemoteBookingRepository).
 */
export function ChangeTierDialog({ isOpen, onClose, fromTier, toTier }: ChangeTierDialogProps) {
  const { mutate, isPending, isSuccess, reset } = useChangeMembershipTier();
  const [error, setError] = useState<string | null>(null);

  const from = getTierConfig(fromTier);
  const to = getTierConfig(toTier);
  const isUpgrade = to.rank > from.rank;

  function handleClose() {
    reset();
    setError(null);
    onClose();
  }

  function handleConfirm() {
    setError(null);
    mutate(toTier, { onError: () => setError("Unable to change your membership right now. Please try again.") });
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isUpgrade ? "Upgrade membership" : "Downgrade membership"}>
      {isSuccess ? (
        <div className="text-center space-y-3 py-4">
          <CheckCircle2 className="h-10 w-10 text-status-quiet mx-auto" />
          <p className="text-sm text-white/70">
            You&apos;re now on <span className="text-white font-medium">{to.name}</span>.
          </p>
          <Button className="w-full" onClick={handleClose}>
            Done
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-center gap-3 text-sm">
            <span className="rounded-full glass px-3 py-1.5 text-white/70">{from.name}</span>
            <ArrowRight className="h-4 w-4 text-white/40" />
            <span className="rounded-full bg-accent/15 px-3 py-1.5 text-accent font-medium">{to.name}</span>
          </div>

          <ul className="space-y-2 text-sm text-white/60">
            {isUpgrade ? (
              <>
                <li>• New perks ({to.name}) apply immediately — no waiting for your next billing cycle.</li>
                <li>• You&apos;ll be billed the prorated difference on your next invoice: {to.priceLabel}.</li>
                <li>• All of your existing bookings stay confirmed exactly as they are.</li>
              </>
            ) : (
              <>
                <li>• Your current perks stay active until the end of this billing cycle.</li>
                <li>• Starting next cycle, you&apos;ll be billed {to.priceLabel} and move to {to.name} limits.</li>
                <li>
                  • Existing bookings are kept, but if {to.name.toLowerCase()} restricts booking or 1:1 sessions, you
                  won&apos;t be able to make new ones of that kind once the change takes effect.
                </li>
              </>
            )}
          </ul>

          {error ? (
            <p role="alert" className="text-sm text-status-peak">
              {error}
            </p>
          ) : null}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleConfirm} isLoading={isPending}>
              Confirm {isUpgrade ? "upgrade" : "downgrade"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
