"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button, buttonVariants } from "@/components/ui/button";

interface UpgradeRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

/**
 * Task #3: "Attempting to book or inspect attendee lists triggers a gentle
 * modal or toast prompting them to upgrade." Deliberately warm/inviting
 * rather than a hard error — this is an upsell moment, not a failure state.
 */
export function UpgradeRequiredModal({ isOpen, onClose, title, description }: UpgradeRequiredModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center space-y-5 py-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent mx-auto">
          <Lock className="h-6 w-6" />
        </div>
        <p className="text-sm text-white/60">{description}</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Not now
          </Button>
          <Link href="/membership" className={buttonVariants({ variant: "primary", className: "flex-1" })}>
            View plans
          </Link>
        </div>
      </div>
    </Modal>
  );
}
