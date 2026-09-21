import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/page-container";

export default function RootLoading() {
  return (
    <PageContainer className="py-16 space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </PageContainer>
  );
}
