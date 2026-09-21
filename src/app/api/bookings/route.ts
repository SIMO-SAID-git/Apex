import { NextRequest, NextResponse } from "next/server";
import { createBookingSchema } from "@/lib/validations/booking-schema";
import { BookingError, getBookingRepository } from "@/lib/services/booking-service";
import { getServerAuthUser } from "@/lib/auth/session";

export async function GET() {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in to view your bookings.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  try {
    const repository = getBookingRepository();
    const bookings = await repository.getBookingsForUser(authUser.id);
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("[GET /api/bookings]", error);
    return NextResponse.json({ error: "Unable to load bookings right now." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in to book a class.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid booking request.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    // Simulate realistic network/processing latency in development.
    if (process.env.NODE_ENV === "development") {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    const repository = getBookingRepository();
    // userId always comes from the verified session — never from the
    // request body — so a customer can never book a class "as" someone else.
    const result = await repository.createBooking({ classId: parsed.data.classId, userId: authUser.id });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof BookingError) {
      const status = error.code === "CLASS_NOT_FOUND" ? 404 : 409;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }
    console.error("[POST /api/bookings]", error);
    return NextResponse.json({ error: "Unable to create booking right now." }, { status: 500 });
  }
}
