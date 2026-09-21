"use client";

import { motion } from "framer-motion";

interface ProgressRingProps {
  label: string;
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  colorClassName?: string;
  displayValue?: string;
}

export function ProgressRing({
  label,
  value,
  size = 96,
  strokeWidth = 8,
  colorClassName = "stroke-accent",
  displayValue,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label}: ${displayValue ?? `${Math.round(value)}%`}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-white/10"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={colorClassName}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-white">{displayValue ?? `${Math.round(value)}%`}</span>
        </div>
      </div>
      <span className="text-xs text-white/60">{label}</span>
    </div>
  );
}
