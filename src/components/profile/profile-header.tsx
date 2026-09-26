import { Calendar } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { initialsFromName } from "@/lib/utils/formatters";
import { formatTenure } from "@/lib/utils/dates";
import type { PublicProfile } from "@/types/profile";

export function ProfileHeader({ profile, isOwner }: { profile: PublicProfile; isOwner: boolean }) {
  return (
    <GlassCard strong className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
      {profile.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.avatarUrl} alt="" className="h-24 w-24 rounded-full object-cover shrink-0" />
      ) : (
        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-accent/15 text-accent text-2xl font-medium shrink-0">
          {initialsFromName(profile.displayName)}
        </span>
      )}

      <div className="flex-1">
        <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
          <h1 className="text-2xl font-display font-medium text-white">{profile.displayName}</h1>
          <Badge tone={profile.role === "trainer" ? "accent" : "neutral"} className="capitalize">
            {profile.role}
          </Badge>
          {isOwner ? <Badge tone="neutral">This is you</Badge> : null}
        </div>
        <p className="mt-1 text-sm text-white/50">@{profile.username}</p>
        <p className="mt-3 flex items-center justify-center sm:justify-start gap-1.5 text-xs text-white/40">
          <Calendar className="h-3.5 w-3.5" />
          Member for {formatTenure(profile.memberSince)}
        </p>
      </div>
    </GlassCard>
  );
}
