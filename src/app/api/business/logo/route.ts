import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const allowed = new Map([["image/png", "png"], ["image/jpeg", "jpg"], ["image/webp", "webp"]]);

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "You must be signed in" }, { status: 401 });
    const { data: business } = await supabase.from("businesses").select("id,logo_path").eq("owner_id", user.id).single();
    if (!business) return NextResponse.json({ error: "Set up your business first" }, { status: 400 });
    const form = await request.formData();
    const file = form.get("logo");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose a logo file" }, { status: 400 });
    const extension = allowed.get(file.type);
    if (!extension) return NextResponse.json({ error: "Logo must be PNG, JPG, JPEG or WebP" }, { status: 400 });
    if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: "Logo must be smaller than 2 MB" }, { status: 400 });
    const path = `businesses/${business.id}/logo-${Date.now()}.${extension}`;
    const upload = await supabase.storage.from("business-logos").upload(path, file, { contentType: file.type, upsert: false });
    if (upload.error) throw upload.error;
    const { error } = await supabase.from("businesses").update({ logo_path: path }).eq("id", business.id);
    if (error) throw error;
    if (business.logo_path) await supabase.storage.from("business-logos").remove([business.logo_path]);
    const { data: signed } = await supabase.storage.from("business-logos").createSignedUrl(path, 3600);
    return NextResponse.json({ url: signed?.signedUrl ?? null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Logo upload failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "You must be signed in" }, { status: 401 });
  const { data: business } = await supabase.from("businesses").select("id,logo_path").eq("owner_id", user.id).single();
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });
  if (business.logo_path) await supabase.storage.from("business-logos").remove([business.logo_path]);
  await supabase.from("businesses").update({ logo_path: null }).eq("id", business.id);
  return NextResponse.json({ ok: true });
}
