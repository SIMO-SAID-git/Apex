"use client";

import { useState } from "react";
import { CalendarPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateWorkoutIcs } from "@/lib/generators/ics-generator";
import type { GeneratedWorkoutPlan } from "@/types/workout";

export function CalendarSyncButton({ plan }: { plan: GeneratedWorkoutPlan }) {
  const [didSync, setDidSync] = useState(false);

  function handleSync() {
    const ics = generateWorkoutIcs(plan);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "apex-workout-plan.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDidSync(true);
    setTimeout(() => setDidSync(false), 2500);
  }

  return (
    <Button variant="secondary" onClick={handleSync}>
      {didSync ? <Check className="h-4 w-4" /> : <CalendarPlus className="h-4 w-4" />}
      {didSync ? "Downloaded" : "Sync recommended plan to calendar"}
    </Button>
  );
}
