import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { FacilityMap } from "@/components/facility/facility-map";

export const metadata: Metadata = {
  title: "Facilities",
  description: "An interactive blueprint of the Apex Performance Club floor plan and equipment.",
};

export default function FacilitiesPage() {
  return (
    <PageContainer className="py-16">
      <div className="max-w-2xl mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-medium">Facilities</h1>
        <p className="mt-3 text-white/60">
          Select a zone to see equipment, feature tags, and current traffic.
        </p>
      </div>
      <FacilityMap />
    </PageContainer>
  );
}
