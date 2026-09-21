"use client";

import { useState } from "react";
import type { FacilityZone } from "@/types/facility";

export function FacilityZoneShape({
  zone,
  onSelect,
}: {
  zone: FacilityZone;
  onSelect: (zoneId: string) => void;
}) {
  const [isActive, setIsActive] = useState(false);

  return (
    <g
      tabIndex={0}
      role="button"
      aria-label={`View details for ${zone.name}`}
      onClick={() => onSelect(zone.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(zone.id);
        }
      }}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onFocus={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
      className="cursor-pointer focus:outline-none"
      style={{ transformOrigin: `${zone.labelX}px ${zone.labelY}px` }}
    >
      <polygon
        points={zone.points}
        className="transition-all duration-200"
        fill={isActive ? "rgba(124,255,107,0.14)" : "rgba(255,255,255,0.03)"}
        stroke={isActive ? "#7CFF6B" : "rgba(255,255,255,0.25)"}
        strokeWidth={isActive ? 2 : 1}
        style={{
          transform: isActive ? "scale(1.02)" : "scale(1)",
          transformOrigin: `${zone.labelX}px ${zone.labelY}px`,
          filter: isActive ? "drop-shadow(0 0 12px rgba(124,255,107,0.35))" : "none",
        }}
      />
      <text
        x={zone.labelX}
        y={zone.labelY}
        textAnchor="middle"
        className="select-none"
        fill={isActive ? "#ffffff" : "rgba(255,255,255,0.6)"}
        fontSize={14}
        fontWeight={500}
      >
        {zone.name}
      </text>
    </g>
  );
}
