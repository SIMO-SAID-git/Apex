"use client";

import { useEffect } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { ErrorState } from "@/components/ui/error-state";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer className="py-24">
      <ErrorState message="An unexpected error occurred while rendering this page." onRetry={reset} />
    </PageContainer>
  );
}
