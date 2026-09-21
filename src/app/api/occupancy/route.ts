import { NextResponse } from "next/server";
import { getOccupancyRepository } from "@/lib/services/occupancy-service";

export async function GET() {
  try {
    const repository = getOccupancyRepository();
    const occupancy = await repository.getOccupancy();
    return NextResponse.json(occupancy);
  } catch (error) {
    console.error("[GET /api/occupancy]", error);
    return NextResponse.json({ error: "Unable to load occupancy right now." }, { status: 500 });
  }
}
