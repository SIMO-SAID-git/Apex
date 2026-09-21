import Link from "next/link";
import type { Metadata } from "next";
import { HeroSection } from "@/components/hero/hero-section";
import { PageContainer } from "@/components/layout/page-container";
import { GlassCard } from "@/components/ui/glass-card";
import { buttonVariants } from "@/components/ui/button";
import { Dumbbell, HeartPulse, Snowflake } from "lucide-react";

export const metadata: Metadata = {
  title: "Apex Performance Club",
  description:
    "Live occupancy, instructor-led classes, and data-driven training under one roof.",
};

const pillars = [
  {
    icon: Dumbbell,
    title: "Strength & Conditioning",
    description: "Competition-grade platforms and coached programming for every level.",
  },
  {
    icon: HeartPulse,
    title: "Instructor-Led Classes",
    description: "22+ weekly sessions across strength, HIIT, cardio, and zen.",
  },
  {
    icon: Snowflake,
    title: "Recovery Built In",
    description: "Cold plunge, sauna, and guided mobility work, not an afterthought.",
  },
];

export default function MarketingHomePage() {
  return (
    <>
      <HeroSection />

      <PageContainer className="py-20 sm:py-28">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl sm:text-4xl font-display font-medium">
            A club built around how you actually train.
          </h2>
          <p className="mt-4 text-white/60">
            Every zone, class, and metric on this site reflects the real state of the club —
            live occupancy, real instructor rosters, and capacity-aware booking.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {pillars.map(({ icon: Icon, title, description }) => (
            <GlassCard key={title} className="p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent mb-4">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-medium text-white">{title}</h3>
              <p className="mt-2 text-sm text-white/60">{description}</p>
            </GlassCard>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/classes" className={buttonVariants({ variant: "primary" })}>
            Browse classes
          </Link>
          <Link href="/facilities" className={buttonVariants({ variant: "outline" })}>
            Explore the facility
          </Link>
        </div>
      </PageContainer>
    </>
  );
}
