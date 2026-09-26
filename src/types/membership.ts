export type MembershipTier = "free" | "foundation" | "performance" | "elite";

export interface MembershipTierConfig {
  id: MembershipTier;
  name: string;
  priceLabel: string;
  priceMonthlyCents: number;
  rank: number; // higher = more access; used for upgrade/downgrade comparisons
  features: string[];
  featured?: boolean;
}

export interface MembershipChangeEvent {
  id: string;
  userId: string;
  fromTier: MembershipTier;
  toTier: MembershipTier;
  direction: "upgrade" | "downgrade" | "initial";
  createdAt: string;
}
