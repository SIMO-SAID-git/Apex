import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/session";
import { getProfileRepository } from "@/lib/services/profile-service";
import { ALLOWED_AVATAR_MIME_TYPES, MAX_AVATAR_BYTES } from "@/lib/validations/profile-schema";
import { detectImageMimeType } from "@/lib/utils/file-signature";
import { isMockMode } from "@/config/site";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in to update your avatar.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return NextResponse.json({ error: "Images must be under 2 MB." }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detectedType = detectImageMimeType(new Uint8Array(buffer));

  if (!detectedType || !ALLOWED_AVATAR_MIME_TYPES.includes(detectedType)) {
    return NextResponse.json(
      { error: "Please upload a JPEG, PNG, or WebP image." },
      { status: 415 }
    );
  }

  try {
    const repository = getProfileRepository();

    if (isMockMode) {
      // Mock mode has no object storage — a small base64 data URL stands in
      // for a real CDN-hosted image so the preview/replace/delete UX can be
      // fully exercised. Real deployments never take this path (see below).
      const dataUrl = `data:${detectedType};base64,${buffer.toString("base64")}`;
      const profile = await repository.updateAvatarUrl(authUser.id, dataUrl);
      return NextResponse.json({ profile });
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Storage is not configured." }, { status: 500 });
    }

    const extension = detectedType === "image/png" ? "png" : detectedType === "image/webp" ? "webp" : "jpg";
    const path = `${authUser.id}/avatar.${extension}`;

    // Uploaded via the session-bound client so Supabase Storage's own RLS
    // policies (see docs/authentication.md) — not this route — are what
    // actually enforce "customers may only write to their own folder".
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, buffer, { contentType: detectedType, upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const profile = await repository.updateAvatarUrl(authUser.id, publicUrlData.publicUrl);

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[POST /api/profile/avatar]", error);
    return NextResponse.json({ error: "Unable to upload your avatar right now." }, { status: 500 });
  }
}

export async function DELETE() {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in to update your avatar.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  try {
    const repository = getProfileRepository();

    if (!isMockMode) {
      const supabase = getSupabaseServerClient();
      if (supabase) {
        await supabase.storage.from("avatars").remove([
          `${authUser.id}/avatar.jpg`,
          `${authUser.id}/avatar.png`,
          `${authUser.id}/avatar.webp`,
        ]);
      }
    }

    const profile = await repository.updateAvatarUrl(authUser.id, null);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[DELETE /api/profile/avatar]", error);
    return NextResponse.json({ error: "Unable to remove your avatar right now." }, { status: 500 });
  }
}
