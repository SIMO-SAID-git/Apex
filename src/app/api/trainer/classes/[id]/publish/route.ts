import { NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/session";
import { ClassError, getClassRepository } from "@/lib/services/booking-service";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  try {
    const published = await getClassRepository().publishClass(params.id, authUser.id);
    return NextResponse.json({ class: published });
  } catch (error) {
    if (error instanceof ClassError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 404 });
    }
    console.error("[POST /api/trainer/classes/:id/publish]", error);
    return NextResponse.json({ error: "Unable to publish this class right now." }, { status: 500 });
  }
}
