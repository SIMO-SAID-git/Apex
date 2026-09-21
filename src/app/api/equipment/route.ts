import { NextResponse } from "next/server";
import { mockFacilityZones, mockTrafficStats } from "@/data/mock-equipment";

export async function GET() {
  return NextResponse.json({ zones: mockFacilityZones, traffic: mockTrafficStats });
}
