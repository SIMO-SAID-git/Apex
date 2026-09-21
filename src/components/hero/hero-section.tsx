import Link from "next/link";
import { HeroVideo } from "@/components/hero/hero-video";
import { KineticHeading } from "@/components/hero/kinetic-heading";
import { LiveActivityCard } from "@/components/hero/live-activity-card";
import { buttonVariants } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";

const POSTER_URL =
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1600&h=1200&fit=crop&q=80";

export function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-end overflow-hidden">
      <HeroVideo
        posterUrl={POSTER_URL}
        sources={[
          { src: "/media/hero-loop.webm", type: "video/webm" },
          { src: "/media/hero-loop.mp4", type: "video/mp4" },
        ]}
      />

      <PageContainer className="relative z-10 pb-20 pt-40">
        <div className="max-w-2xl">
          <KineticHeading
            text="Train with intent."
            className="text-5xl sm:text-6xl lg:text-7xl font-display font-medium tracking-tight leading-[1.05]"
          />
          <p className="mt-6 text-lg text-white/70 max-w-lg">
            Live class capacity, instructor-led programming, and a facility built around how you
            actually train — strength, conditioning, and recovery under one roof.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/dashboard/schedule" className={buttonVariants({ size: "lg", variant: "primary" })}>
              Book a class
            </Link>
            <Link href="/membership" className={buttonVariants({ size: "lg", variant: "secondary" })}>
              View membership
            </Link>
          </div>
        </div>

        <div className="absolute right-4 sm:right-8 lg:right-8 bottom-20">
          <LiveActivityCard />
        </div>
      </PageContainer>
    </section>
  );
}
