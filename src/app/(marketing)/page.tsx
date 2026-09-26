import Link from "next/link";
import type { Metadata } from "next";
import { HeroSection } from "@/components/hero/hero-section";
import { PageContainer } from "@/components/layout/page-container";
import { PhotoCard } from "@/components/ui/photo-card";
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
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&h=1100&fit=crop&q=80",
    imageAlt: "Barbell racks in a strength training area",
  },
  {
    icon: HeartPulse,
    title: "Instructor-Led Classes",
    description: "22+ weekly sessions across strength, HIIT, cardio, and zen.",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&h=1100&fit=crop&q=80",
    imageAlt: "Group fitness class in session",
  },
  {
    icon: Snowflake,
    title: "Recovery Built In",
    description: "Cold plunge, sauna, and guided mobility work, not an afterthought.",
    imageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=900&h=1100&fit=crop&q=80",
    imageAlt: "Cold plunge recovery pool",
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
          {pillars.map((pillar) => (
            <PhotoCard key={pillar.title} className="aspect-[4/5]" {...pillar} />
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
