import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { ClassScheduler } from "@/components/scheduler/class-scheduler";
import { ClassSlotSkeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Classes",
  description: "Browse and book instructor-led strength, HIIT, cardio, and zen classes.",
};

export default function ClassesPage() {
  return (
    <PageContainer className="py-16">
      <div className="max-w-2xl mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-medium">Classes</h1>
        <p className="mt-3 text-white/60">
          Live capacity, real instructors. Filter by category, intensity, or coach and book in a
          couple of taps.
        </p>
      </div>
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
