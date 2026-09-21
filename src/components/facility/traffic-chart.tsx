import type { TrafficStats } from "@/types/facility";

export function TrafficChart({ stats }: { stats: TrafficStats }) {
  const width = 280;
  const height = 80;
  const barWidth = width / stats.hourly.length - 2;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-white/50">Hourly traffic</p>
        <p className="text-xs text-white/50">Peak: {stats.peakHour}:00</p>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-20"
        role="img"
        aria-label={`Hourly traffic chart, peaking around ${stats.peakHour}:00, currently at ${stats.currentLevel}% capacity`}
      >
        {stats.hourly.map((point, index) => {
          const barHeight = (point.level / 100) * height;
          const isPeak = point.hour === stats.peakHour;
          return (
            <rect
              key={point.hour}
              x={index * (barWidth + 2)}
              y={height - barHeight}
              width={barWidth}
              height={barHeight}
              rx={1}
              fill={isPeak ? "#7CFF6B" : "rgba(255,255,255,0.18)"}
            />
          );
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-white/30 mt-1">
        <span>12am</span>
        <span>12pm</span>
        <span>11pm</span>
      </div>
    </div>
  );
}
