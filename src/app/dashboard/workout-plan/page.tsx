import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { WorkoutGenerator } from "@/components/workout/workout-generator";

export const metadata: Metadata = {
  title: "Workout Plan",
  robots: { index: false, follow: false },
};

export default function WorkoutPlanPage() {
  return (
    <PageContainer className="py-16 max-w-3xl">
      <h1 className="text-3xl font-display font-medium mb-2">Workout Plan Generator</h1>
      <p className="text-white/60 mb-10">
        Answer three questions and get a deterministic weekly plan built from the club&apos;s class
        categories.
      </p>
      <WorkoutGenerator />
    </PageContainer>
  );
}
