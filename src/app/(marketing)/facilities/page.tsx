import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { FacilityGrid } from "@/components/facility/facility-grid";

export const metadata: Metadata = {
  title: "Facilities",
  description: "Explore the Apex Performance Club floor — equipment, hours, and rules for every zone.",
};

export default function FacilitiesPage() {
  return (
    <PageContainer className="py-16">
      <div className="max-w-2xl mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-medium">Facilities</h1>
        <p className="mt-3 text-white/60">
          Select a zone to see equipment, rules, hours, and current traffic.
        </p>
      </div>
      <FacilityGrid />
    </PageContainer>
  );
}
