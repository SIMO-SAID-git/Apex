import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { BookingsList } from "@/app/dashboard/bookings/bookings-list";

export const metadata: Metadata = {
  title: "Bookings",
  robots: { index: false, follow: false },
};

export default function BookingsPage() {
  return (
    <PageContainer className="py-16">
      <h1 className="text-3xl font-display font-medium mb-8">Your bookings</h1>
      <BookingsList />
    </PageContainer>
  );
}
