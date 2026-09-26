"use client";

import { useEquipment } from "@/hooks/queries/use-equipment";
import { useFacilityStore } from "@/stores/facility-store";
import { PhotoCard } from "@/components/ui/photo-card";
import { EquipmentDrawer } from "@/components/facility/equipment-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";

/**
 * Task #7: replaces the old plain grid boxes with photo cards (each zone's
 * own image as the background, title overlaid), and clicking a card opens
 * the same equipment/rules/traffic drawer the SVG blueprint used to. See
 * facility-map.tsx for the earlier abstract-blueprint version, kept in the
 * codebase but no longer used on this page.
 */
export function FacilityGrid() {
  const { data, isLoading, isError, refetch } = useEquipment();
  const selectZone = useFacilityStore((s) => s.selectZone);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState message="We couldn't load the facility zones." onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.zones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => selectZone(zone.id)}
            className="text-left focus-visible:ring-2 focus-visible:ring-accent/60 rounded-2xl"
            aria-label={`View details for ${zone.name}`}
          >
            <PhotoCard
              imageUrl={zone.images[0] ?? ""}
              imageAlt={zone.name}
              title={zone.name}
              align="center"
              className="aspect-[4/3]"
            />
          </button>
        ))}
      </div>
      <EquipmentDrawer zones={data.zones} traffic={data.traffic} />
    </div>
  );
}
