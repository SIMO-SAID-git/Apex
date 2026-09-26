import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/session";
import { getProfileRepository } from "@/lib/services/profile-service";
import { getClassRepository } from "@/lib/services/booking-service";
import { createClassSchema } from "@/lib/validations/class-schema";

async function requireTrainer(authUserId: string) {
  const profile = await getProfileRepository().getProfile(authUserId);
  if (profile?.role !== "trainer") return null;
  return profile;
}

export async function GET() {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  const trainer = await requireTrainer(authUser.id);
  if (!trainer) {
    return NextResponse.json({ error: "Only trainer accounts can manage classes.", code: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const classes = await getClassRepository().getClasses({ instructorId: authUser.id, includeUnpublished: true });
    return NextResponse.json({ classes });
  } catch (error) {
    console.error("[GET /api/trainer/classes]", error);
    return NextResponse.json({ error: "Unable to load your classes right now." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  const trainer = await requireTrainer(authUser.id);
  if (!trainer) {
    return NextResponse.json({ error: "Only trainer accounts can create classes.", code: "FORBIDDEN" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = createClassSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid class data.", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const created = await getClassRepository().createClass(authUser.id, parsed.data);
    return NextResponse.json({ class: created }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/trainer/classes]", error);
    return NextResponse.json({ error: "Unable to create this class right now." }, { status: 500 });
  }
}
