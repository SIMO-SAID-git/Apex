import { NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/session";
import { getProfileRepository } from "@/lib/services/profile-service";
import { getClassRepository } from "@/lib/services/booking-service";
import { canViewAttendeeRoster } from "@/lib/auth/permissions";

/**
 * Task #3: free members are blocked from "viewing attendee rosters for
 * classes". Enforced here, server-side, based on the CALLER's own profile —
 * never on anything the client claims about itself.
 */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in to view attendees.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  const profileRepository = getProfileRepository();
  const callerProfile = await profileRepository.getProfile(authUser.id);

  if (!canViewAttendeeRoster(callerProfile)) {
    return NextResponse.json(
      { error: "Viewing the attendee list requires a paid membership.", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  try {
    const fitnessClass = await getClassRepository().getClassById(params.id);
    if (!fitnessClass) {
      return NextResponse.json({ error: "Class not found." }, { status: 404 });
    }

    const { getBookingsForClassAdmin } = await import("@/lib/services/booking-service");
    const bookings = await getBookingsForClassAdmin(params.id);

    const attendees = await Promise.all(
      bookings
        .filter((b) => b.status !== "cancelled")
        .map(async (b) => {
          const p = await profileRepository.getProfile(b.userId);
          return { displayName: p?.displayName ?? "Member", status: b.status };
        })
    );

    return NextResponse.json({ attendees });
  } catch (error) {
    console.error("[GET /api/classes/:id/attendees]", error);
    return NextResponse.json({ error: "Unable to load attendees right now." }, { status: 500 });
  }
}
