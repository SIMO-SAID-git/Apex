import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/session";
import { getProfileRepository } from "@/lib/services/profile-service";
import { getSessionRepository, SessionError } from "@/lib/services/session-service";
import { createSessionSchema } from "@/lib/validations/session-schema";

export async function GET() {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  try {
    const profile = await getProfileRepository().getProfile(authUser.id);
    const repository = getSessionRepository();
    const sessions =
      profile?.role === "trainer"
        ? await repository.getSessionsForTrainer(authUser.id)
        : await repository.getSessionsForMember(authUser.id);
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("[GET /api/trainer-sessions]", error);
    return NextResponse.json({ error: "Unable to load sessions right now." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in to book a session.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = createSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid session request.", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const session = await getSessionRepository().bookSession(authUser.id, parsed.data);
    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    if (error instanceof SessionError) {
      const status = error.code === "TRAINER_NOT_FOUND" ? 404 : error.code === "NOT_ELITE" ? 403 : 400;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }
    console.error("[POST /api/trainer-sessions]", error);
    return NextResponse.json({ error: "Unable to book this session right now." }, { status: 500 });
  }
}
