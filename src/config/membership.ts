import type { MembershipTierConfig } from "@/types/membership";

/**
 * Single source of truth for pricing/features. Every surface that shows or
 * reasons about membership — the marketing page, upgrade/downgrade flow,
 * permission checks, the Elite 1:1 CTA — reads from this array rather than
 * hardcoding a price or tier name anywhere else.
 */
export const MEMBERSHIP_TIERS: MembershipTierConfig[] = [
  {
    id: "free",
    name: "Free",
    priceLabel: "$0/mo",
    priceMonthlyCents: 0,
    rank: 0,
    features: ["Browse classes & trainers", "View live occupancy", "Workout plan generator"],
  },
  {
    id: "foundation",
    name: "Foundation",
    priceLabel: "$49.90/mo",
    priceMonthlyCents: 4990,
    rank: 1,
    features: ["Full floor access", "8 classes / month", "Cardio deck & functional zone"],
  },
  {
    id: "performance",
    name: "Performance",
    priceLabel: "$149.00/mo",
    priceMonthlyCents: 14900,
    rank: 2,
    features: ["Full floor access", "Unlimited classes", "Cold plunge & sauna access", "Monthly coaching check-in"],
    featured: true,
  },
  {
    id: "elite",
    name: "Elite",
    priceLabel: "$199.00/mo",
    priceMonthlyCents: 19900,
    rank: 3,
    features: ["Everything in Performance", "1:1 training sessions with any trainer", "Priority class booking", "Guest passes (2/mo)"],
  },
];

export function getTierConfig(tier: string): MembershipTierConfig {
  return MEMBERSHIP_TIERS.find((t) => t.id === tier) ?? MEMBERSHIP_TIERS[0]!;
}

export function canBookClasses(tier: string): boolean {
  // Free members can browse but not book; everything Foundation and up can.
  return getTierConfig(tier).rank >= 1;
}

export function canViewRoster(tier: string): boolean {
  return getTierConfig(tier).rank >= 1;
}
