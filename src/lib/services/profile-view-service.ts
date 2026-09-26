import "server-only";
import { randomUUID } from "crypto";
import { isMockMode } from "@/config/site";
import { getSupabaseServerClient, getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export interface ProfileViewStats {
  totalViews: number;
  last30DaysViews: number;
}

interface ProfileViewRecord {
  id: string;
  profileUserId: string;
  viewerUserId: string | null;
  viewedAt: string;
}

class InMemoryProfileViewStore {
  private static instance: InMemoryProfileViewStore;
  views: ProfileViewRecord[] = [];
  private constructor() {}
  static get(): InMemoryProfileViewStore {
    if (!InMemoryProfileViewStore.instance) InMemoryProfileViewStore.instance = new InMemoryProfileViewStore();
    return InMemoryProfileViewStore.instance;
  }
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Records a profile view and never throws — a failed view-count write
 * should never break rendering the profile page itself. Call sites treat
 * this as fire-and-forget (see app/profile/[username]/page.tsx).
 */
export async function recordProfileView(profileUserId: string, viewerUserId: string | null): Promise<void> {
  // Never count a self-view — that would make the counter meaningless for
  // the one person who checks it most often.
  if (viewerUserId === profileUserId) return;

  try {
    if (isMockMode) {
      InMemoryProfileViewStore.get().views.push({
        id: randomUUID(),
        profileUserId,
        viewerUserId,
        viewedAt: new Date().toISOString(),
      });
      return;
    }

    // profile_views has no insert policy for authenticated/anon (see the
    // migration) — recording a view must never depend on the viewer having
    // any particular grant, including anonymous visitors.
    const serviceClient = getSupabaseServiceRoleClient();
    if (!serviceClient) return;
    await serviceClient.from("profile_views").insert({ profile_user_id: profileUserId, viewer_user_id: viewerUserId });
  } catch (error) {
    console.error("[recordProfileView]", error);
  }
}

export async function getProfileViewStats(profileUserId: string): Promise<ProfileViewStats> {
  const cutoff = Date.now() - THIRTY_DAYS_MS;

  if (isMockMode) {
    const views = InMemoryProfileViewStore.get().views.filter((v) => v.profileUserId === profileUserId);
    return {
      totalViews: views.length,
      last30DaysViews: views.filter((v) => new Date(v.viewedAt).getTime() >= cutoff).length,
    };
  }

  const client = getSupabaseServerClient();
  if (!client) return { totalViews: 0, last30DaysViews: 0 };

  const { count: totalViews } = await client
    .from("profile_views")
    .select("*", { count: "exact", head: true })
    .eq("profile_user_id", profileUserId);

  const { count: last30DaysViews } = await client
    .from("profile_views")
    .select("*", { count: "exact", head: true })
    .eq("profile_user_id", profileUserId)
    .gte("viewed_at", new Date(cutoff).toISOString());

  return { totalViews: totalViews ?? 0, last30DaysViews: last30DaysViews ?? 0 };
}
