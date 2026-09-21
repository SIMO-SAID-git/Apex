"use client";

import { Clock } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { EquipmentGallery } from "@/components/facility/equipment-gallery";
import { TrafficChart } from "@/components/facility/traffic-chart";
import { useFacilityStore } from "@/stores/facility-store";
import type { FacilityZone, TrafficStats } from "@/types/facility";

export function EquipmentDrawer({ zones, traffic }: { zones: FacilityZone[]; traffic: TrafficStats[] }) {
  const { selectedZoneId, drawerOpen, closeDrawer } = useFacilityStore();
  const zone = zones.find((z) => z.id === selectedZoneId);
  const stats = traffic.find((t) => t.zoneId === selectedZoneId);

  if (!zone) return null;

  return (
    <Drawer isOpen={drawerOpen} onClose={closeDrawer} title={zone.name}>
      <div className="space-y-6">
        <p className="text-sm text-white/70">{zone.description}</p>

        <EquipmentGallery images={zone.images} zoneName={zone.name} />

        <div className="flex items-center gap-2 text-sm text-white/60">
          <Clock className="h-4 w-4" />
          {zone.operatingHours}
        </div>

        <div className="flex flex-wrap gap-2">
          {zone.featureTags.map((tag) => (
            <Badge key={tag} tone="accent">
              {tag}
            </Badge>
          ))}
        </div>

        <div>
          <p className="text-sm font-medium text-white mb-2">Equipment</p>
          <ul className="space-y-1.5">
            {zone.equipment.map((item) => (
              <li key={item} className="text-sm text-white/60 flex gap-2">
                <span className="text-accent" aria-hidden>·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {stats ? <TrafficChart stats={stats} /> : null}
      </div>
    </Drawer>
  );
}
