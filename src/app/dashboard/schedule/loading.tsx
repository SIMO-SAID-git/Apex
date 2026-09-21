import { ClassSlotSkeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ScheduleLoading() {
  return (
    <PageContainer className="py-16 space-y-6">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-14 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ClassSlotSkeleton key={i} />
        ))}
      </div>
    </PageContainer>
  );
}
