import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { ClassScheduler } from "@/components/scheduler/class-scheduler";
import { ClassSlotSkeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Schedule",
  robots: { index: false, follow: false },
};

export default function DashboardSchedulePage() {
  return (
    <PageContainer className="py-16">
      <h1 className="text-3xl font-display font-medium mb-8">Schedule</h1>
      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ClassSlotSkeleton key={i} />
            ))}
          </div>
        }
      >
        <ClassScheduler />
      </Suspense>
    </PageContainer>
  );
}
