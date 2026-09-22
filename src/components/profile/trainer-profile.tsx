import { Instagram, Globe, Youtube, DollarSign, Award, Clock } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import type { PublicTrainerProfile } from "@/types/profile";

const SPECIALTY_LABEL: Record<string, string> = {
  strength: "Strength",
  hiit: "HIIT",
  cardio: "Cardio",
  zen: "Zen",
};

const DAY_LABEL: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

/** Public view for role === "trainer" — this is the marketing surface a
 *  member browses before booking a class with this coach. */
export function TrainerProfile({ profile }: { profile: PublicTrainerProfile }) {
  const hasSocialLinks = Object.values(profile.socialLinks).some(Boolean);

  return (
    <div className="space-y-6">
      {profile.bio ? (
        <GlassCard className="p-6">
          <h2 className="font-medium text-white mb-2">About</h2>
          <p className="text-sm text-white/60 whitespace-pre-line">{profile.bio}</p>
        </GlassCard>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard className="p-6">
          <h2 className="font-medium text-white mb-3">Specialties</h2>
          {profile.specialties.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.specialties.map((s) => (
                <Badge key={s} tone="accent">
                  {SPECIALTY_LABEL[s] ?? s}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40">Not listed yet.</p>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-4 w-4 text-white/40" />
            <h2 className="font-medium text-white">Certifications</h2>
          </div>
          {profile.certifications.length > 0 ? (
            <ul className="space-y-1.5">
              {profile.certifications.map((cert) => (
                <li key={cert} className="text-sm text-white/60">
                  {cert}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/40">Not listed yet.</p>
          )}
        </GlassCard>
      </div>

      {profile.hourlyRate != null ? (
        <GlassCard className="p-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent">
            <DollarSign className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm text-white/50">1:1 session rate</p>
            <p className="text-lg font-semibold text-white">${profile.hourlyRate}/hr</p>
          </div>
        </GlassCard>
      ) : null}

      {profile.availability.length > 0 ? (
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-white/40" />
            <h2 className="font-medium text-white">Availability</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.availability.map((window, i) => (
              <Badge key={i} tone="neutral">
                {DAY_LABEL[window.day]} {window.start}–{window.end}
              </Badge>
            ))}
          </div>
        </GlassCard>
      ) : null}

      {hasSocialLinks ? (
        <GlassCard className="p-6">
          <h2 className="font-medium text-white mb-3">Find {profile.displayName.split(" ")[0]} online</h2>
          <div className="flex gap-3">
            {profile.socialLinks.instagram ? (
              <a
                href={profile.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
            ) : null}
            {profile.socialLinks.website ? (
              <a
                href={profile.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="Website"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Globe className="h-4 w-4" />
              </a>
            ) : null}
            {profile.socialLinks.youtube ? (
              <a
                href={profile.socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="YouTube"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Youtube className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </GlassCard>
      ) : null}
    </div>
  );
}
