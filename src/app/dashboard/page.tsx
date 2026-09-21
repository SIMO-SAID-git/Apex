import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Dumbbell, Ticket } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { GlassCard } from "@/components/ui/glass-card";
import { LiveOccupancyWidget } from "@/components/hero/live-occupancy-widget";
import { DashboardGreeting } from "@/app/dashboard/dashboard-greeting";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const links = [
  { href: "/dashboard/schedule", label: "Schedule", description: "Browse and book classes", icon: CalendarDays },
  { href: "/dashboard/workout-plan", label: "Workout Plan", description: "Generate a weekly plan", icon: Dumbbell },
  { href: "/dashboard/bookings", label: "Bookings", description: "Manage your upcoming classes", icon: Ticket },
];

export default function DashboardPage() {
  return (
    <PageContainer className="py-16">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-medium">Dashboard</h1>
          <DashboardGreeting />
        </div>
        <GlassCard className="px-4 py-3">
          <LiveOccupancyWidget />
        </GlassCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {links.map(({ href, label, description, icon: Icon }) => (
          <Link key={href} href={href} className="focus-visible:ring-2 focus-visible:ring-accent/60 rounded-2xl">
            <GlassCard className="p-6 interactive h-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent mb-4">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-medium text-white">{label}</h2>
              <p className="mt-1 text-sm text-white/60">{description}</p>
            </GlassCard>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
