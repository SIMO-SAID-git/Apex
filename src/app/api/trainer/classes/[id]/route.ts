import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/session";
import { ClassError, getClassRepository } from "@/lib/services/booking-service";
import { updateClassSchema } from "@/lib/validations/class-schema";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = updateClassSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid class data.", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    // Ownership (instructorId === authUser.id) is enforced inside the
    // repository, not here — the same rule the DELETE handler below relies on.
    const updated = await getClassRepository().updateClass(params.id, authUser.id, parsed.data);
    return NextResponse.json({ class: updated });
  } catch (error) {
    if (error instanceof ClassError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 404 });
    }
    console.error("[PATCH /api/trainer/classes/:id]", error);
    return NextResponse.json({ error: "Unable to update this class right now." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  try {
    await getClassRepository().cancelClass(params.id, authUser.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ClassError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 404 });
    }
    console.error("[DELETE /api/trainer/classes/:id]", error);
    return NextResponse.json({ error: "Unable to cancel this class right now." }, { status: 500 });
  }
}
