import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerAuthUser } from "@/lib/auth/session";
import { getProfileRepository } from "@/lib/services/profile-service";
import { getBookingRepository } from "@/lib/services/booking-service";
import { isMockMode } from "@/config/site";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getMockAuthStore } from "@/lib/auth/mock-auth-store";
import { MOCK_SESSION_COOKIE } from "@/lib/auth/mock-session";

/**
 * Account deletion is destructive and requires privileged access to remove
 * the underlying auth user — something an anon-key/RLS-scoped client can
 * never do for itself. This route is the ONLY place that touches the
 * service-role client, and it does so only after re-confirming the caller's
 * own identity from their session (never from a client-supplied id).
 *
 * Deletion/anonymization strategy (documented, not silent):
 *  1. Cancel every active booking the customer holds (frees the spot for
 *     someone else immediately, same code path as a normal cancellation).
 *  2. Delete the `profiles` row. In production this also happens
 *     automatically via `ON DELETE CASCADE` on profiles.user_id once the
 *     auth user is removed (see the migration) — deleting it explicitly
 *     here as well keeps mock mode's behavior identical.
 *  3. Delete the Supabase Auth user (production) / the mock auth user
 *     (mock mode), then clear the session cookie.
 * Historical booking rows are NOT retained after this — there is no
 * separate "anonymize" step because this app keeps no other customer data.
 */
export async function DELETE() {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in to delete your account.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  try {
    const bookingRepository = getBookingRepository();
    const bookings = await bookingRepository.getBookingsForUser(authUser.id);
    for (const booking of bookings) {
      if (booking.status !== "cancelled") {
        await bookingRepository.cancelBooking(booking.id, authUser.id);
      }
    }

    const profileRepository = getProfileRepository();
    await profileRepository.deleteProfile(authUser.id);

    if (isMockMode) {
      getMockAuthStore().delete(authUser.id);
      cookies().delete(MOCK_SESSION_COOKIE);
    } else {
      const serviceClient = getSupabaseServiceRoleClient();
      if (!serviceClient) {
        return NextResponse.json({ error: "Account deletion is not configured on the server." }, { status: 500 });
      }
      const { error } = await serviceClient.auth.admin.deleteUser(authUser.id);
      if (error) throw error;
      // The Supabase-managed session cookies are cleared by the browser
      // client's own signOut() call, which the UI triggers right after this
      // request succeeds (see delete-account-dialog.tsx).
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/account]", error);
    return NextResponse.json({ error: "Unable to delete your account right now. Please try again." }, { status: 500 });
  }
}
