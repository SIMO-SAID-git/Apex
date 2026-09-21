"use client";

import { Tooltip } from "@/components/ui/tooltip";
import { InstructorAvatar } from "@/components/scheduler/instructor-avatar";
import type { Instructor } from "@/types/instructor";

export function InstructorTooltip({ instructor }: { instructor: Instructor }) {
  return (
    <Tooltip
      label={
        <div className="space-y-1.5">
          <p className="font-medium text-white">{instructor.name}</p>
          <p className="text-white/70">{instructor.bio}</p>
          <p className="text-white/50">
            {instructor.yearsExperience} yrs · {instructor.certifications.join(", ")}
          </p>
        </div>
      }
    >
      <InstructorAvatar name={instructor.name} avatarUrl={instructor.avatarUrl} />
    </Tooltip>
  );
}
