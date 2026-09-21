import { NextResponse } from "next/server";
import { mockActivityEvents } from "@/data/mock-activity";

export async function GET() {
  try {
    return NextResponse.json({ events: mockActivityEvents });
  } catch (error) {
    console.error("[GET /api/activity]", error);
    return NextResponse.json({ error: "Unable to load activity right now." }, { status: 500 });
  }
}
