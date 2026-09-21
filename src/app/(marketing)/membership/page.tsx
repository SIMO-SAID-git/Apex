import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { GlassCard } from "@/components/ui/glass-card";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Membership",
  description: "Membership tiers for Apex Performance Club.",
};

const tiers = [
  {
    name: "Foundation",
    price: "$89/mo",
    features: ["Full floor access", "8 classes / month", "Cardio deck & functional zone"],
  },
  {
    name: "Performance",
    price: "$149/mo",
    features: ["Full floor access", "Unlimited classes", "Cold plunge & sauna access", "Monthly coaching check-in"],
    featured: true,
  },
  {
    name: "Elite",
    price: "$249/mo",
    features: ["Everything in Performance", "1:1 programming", "Priority class booking", "Guest passes (2/mo)"],
  },
];

export default function MembershipPage() {
  return (
    <PageContainer className="py-16">
      <div className="max-w-2xl mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-medium">Membership</h1>
        <p className="mt-3 text-white/60">Choose the tier that matches how often you train.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <GlassCard
            key={tier.name}
            strong={tier.featured}
            className={`p-6 flex flex-col ${tier.featured ? "ring-1 ring-accent/40" : ""}`}
          >
            {tier.featured ? (
              <span className="self-start mb-3 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">
                Most popular
              </span>
            ) : null}
            <h2 className="text-lg font-semibold text-white">{tier.name}</h2>
            <p className="mt-1 text-2xl font-display">{tier.price}</p>
            <ul className="mt-5 space-y-2.5 flex-1">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-white/70">
                  <Check className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard"
              className={buttonVariants({ variant: tier.featured ? "primary" : "outline", className: "w-full mt-6" })}
            >
              Get started
            </Link>
          </GlassCard>
        ))}
      </div>
    </PageContainer>
  );
}
