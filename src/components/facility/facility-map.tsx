"use client";

import { useEquipment } from "@/hooks/queries/use-equipment";
import { useFacilityStore } from "@/stores/facility-store";
import { FacilityZoneShape } from "@/components/facility/facility-zone";
import { FacilityLegend } from "@/components/facility/facility-legend";
import { EquipmentDrawer } from "@/components/facility/equipment-drawer";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";

export function FacilityMap() {
  const { data, isLoading, isError, refetch } = useEquipment();
  const selectZone = useFacilityStore((s) => s.selectZone);

  if (isLoading) {
    return <Skeleton className="h-[420px] w-full rounded-2xl" />;
  }

  if (isError || !data) {
    return <ErrorState message="We couldn't load the facility map." onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-4">
      <GlassCard className="p-4 sm:p-6">
        <svg
          viewBox="0 0 720 660"
          className="w-full h-auto"
          role="img"
          aria-label="Interactive facility blueprint. Select a zone to view equipment details."
        >
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="720" height="660" fill="url(#grid)" />
          {data.zones.map((zone) => (
            <FacilityZoneShape key={zone.id} zone={zone} onSelect={selectZone} />
          ))}
        </svg>
      </GlassCard>
      <FacilityLegend />
      <EquipmentDrawer zones={data.zones} traffic={data.traffic} />
    </div>
  );
}
