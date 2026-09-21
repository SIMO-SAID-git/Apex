import { NextResponse } from "next/server";
import { mockInstructors } from "@/data/mock-instructors";

export async function GET() {
  return NextResponse.json({ instructors: mockInstructors });
}
