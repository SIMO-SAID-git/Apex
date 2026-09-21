import { NextRequest, NextResponse } from "next/server";
import { getClassRepository } from "@/lib/services/booking-service";

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get("date") ?? undefined;
    const repository = getClassRepository();
    const classes = await repository.getClasses(date ? { date } : undefined);
    return NextResponse.json({ classes });
  } catch (error) {
    console.error("[GET /api/classes]", error);
    return NextResponse.json({ error: "Unable to load classes right now." }, { status: 500 });
  }
}
