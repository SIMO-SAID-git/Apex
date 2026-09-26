"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChangeTierDialog } from "@/components/membership/change-tier-dialog";
import { useAuth } from "@/hooks/auth/use-auth";
import { MEMBERSHIP_TIERS } from "@/config/membership";
import type { MembershipTier } from "@/types/membership";
import { cn } from "@/lib/utils/cn";

export function MembershipTiers() {
  const router = useRouter();
  const { isAuthenticated, profile } = useAuth();
  const [pendingChange, setPendingChange] = useState<MembershipTier | null>(null);

  const currentTier = profile && profile.role !== "trainer" ? profile.membershipTier : null;
  const visibleTiers = MEMBERSHIP_TIERS.filter((t) => t.id !== "free");

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        {visibleTiers.map((tier) => {
          const isCurrent = currentTier === tier.id;

          return (
            <GlassCard
              key={tier.id}
              strong={tier.featured}
              className={cn("p-6 flex flex-col", tier.featured && "ring-1 ring-accent/40")}
            >
              {tier.featured ? (
                <span className="self-start mb-3 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">
                  Most popular
                </span>
              ) : null}
              <h2 className="text-lg font-semibold text-white">{tier.name}</h2>
              <p className="mt-1 text-2xl font-display">{tier.priceLabel}</p>
              <ul className="mt-5 space-y-2.5 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-white/70">
                    <Check className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <Badge tone="accent" className="w-full justify-center mt-6 py-2.5">
                  Your current plan
                </Badge>
              ) : isAuthenticated && currentTier ? (
                <Button
                  variant={tier.featured ? "primary" : "outline"}
                  className="w-full mt-6"
                  onClick={() => setPendingChange(tier.id)}
                >
                  {tier.rank > (MEMBERSHIP_TIERS.find((t) => t.id === currentTier)?.rank ?? 0) ? "Upgrade" : "Downgrade"}
                  {" to "}
                  {tier.name}
                </Button>
              ) : isAuthenticated ? (
                <Button variant={tier.featured ? "primary" : "outline"} className="w-full mt-6" onClick={() => setPendingChange(tier.id)}>
                  Choose {tier.name}
                </Button>
              ) : (
                <Link
                  href={`/register`}
                  className={buttonVariants({ variant: tier.featured ? "primary" : "outline", className: "w-full mt-6" })}
                >
                  Get started
                </Link>
              )}
            </GlassCard>
          );
        })}
      </div>

      {pendingChange ? (
        <ChangeTierDialog
          isOpen={Boolean(pendingChange)}
          onClose={() => {
            setPendingChange(null);
            router.refresh();
          }}
          fromTier={currentTier ?? "free"}
          toTier={pendingChange}
        />
      ) : null}
    </>
  );
}
