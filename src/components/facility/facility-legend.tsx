export function FacilityLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-white/50 flex-wrap">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
        Interactive zone
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-sm border border-white/30" aria-hidden />
        Structural outline
      </span>
    </div>
  );
}
