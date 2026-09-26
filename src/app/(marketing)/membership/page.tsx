import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { MembershipTiers } from "@/components/membership/membership-tiers";

export const metadata: Metadata = {
  title: "Membership",
  description: "Membership tiers for Apex Performance Club.",
};

export default function MembershipPage() {
  return (
    <PageContainer className="py-16">
      <div className="max-w-2xl mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-medium">Membership</h1>
        <p className="mt-3 text-white/60">
          Choose the tier that matches how often you train. Trainers get full platform access
          automatically and never need to pay for a tier.
        </p>
      </div>

      <MembershipTiers />
    </PageContainer>
  );
}
