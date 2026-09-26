import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { HistoryTabs } from "@/components/dashboard/history-tabs";

export const metadata: Metadata = {
  title: "History",
  robots: { index: false, follow: false },
};

export default function HistoryPage() {
  return (
    <PageContainer className="py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-medium mb-2">History</h1>
        <p className="text-white/60">Your bookings, membership changes, and 1:1 sessions in one place.</p>
      </div>
      <HistoryTabs />
    </PageContainer>
  );
}
