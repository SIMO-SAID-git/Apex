import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MOCK_SESSION_COOKIE } from "@/lib/auth/mock-session";

export async function POST() {
  cookies().delete(MOCK_SESSION_COOKIE);
  return NextResponse.json({ success: true });
}
