import { Target } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import type { PublicMemberProfile } from "@/types/profile";

const GOAL_LABEL: Record<string, string> = {
  "build-strength": "Build Strength",
  "lose-fat": "Lose Fat",
  "improve-conditioning": "Improve Conditioning",
  "mobility-recovery": "Mobility & Recovery",
  "general-fitness": "General Fitness",
};

/** Public view for role === "member". Deliberately minimal — a member's
 *  profile is not a marketing surface the way a trainer's is. */
export function MemberProfile({ profile }: { profile: PublicMemberProfile }) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Target className="h-4 w-4" />
        </div>
        <h2 className="font-medium text-white">Training focus</h2>
      </div>
      <p className="text-sm text-white/60 mt-2">
        {profile.fitnessGoal ? GOAL_LABEL[profile.fitnessGoal] : "This member hasn't set a public training goal yet."}
      </p>
    </GlassCard>
  );
}
