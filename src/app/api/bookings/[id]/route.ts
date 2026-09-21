import { NextRequest, NextResponse } from "next/server";
import { cancelBookingParamsSchema } from "@/lib/validations/booking-schema";
import { BookingError, getBookingRepository } from "@/lib/services/booking-service";
import { getServerAuthUser } from "@/lib/auth/session";

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in to manage your bookings.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  const parsed = cancelBookingParamsSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking id." }, { status: 400 });
  }

  try {
    const repository = getBookingRepository();
    // Ownership is re-checked inside cancelBooking against authUser.id —
    // a customer can never cancel a booking that isn't their own, even if
    // they somehow learn another customer's booking id.
    await repository.cancelBooking(parsed.data.id, authUser.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 404 });
    }
    console.error("[DELETE /api/bookings/:id]", error);
    return NextResponse.json({ error: "Unable to cancel booking right now." }, { status: 500 });
  }
}
