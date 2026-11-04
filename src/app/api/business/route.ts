import { NextResponse } from "next/server";
import { businessSchema } from "@/lib/validations/business";
import { slugify } from "@/lib/utils/slug";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function message(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "You must be signed in" }, { status: 401 });
    const { data, error } = await supabase.from("businesses").select("*").eq("owner_id", user.id).maybeSingle();
    if (error) throw error;
    return NextResponse.json({ business: data });
  } catch (error) {
    return NextResponse.json({ error: message(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "You must be signed in" }, { status: 401 });
    const existing = await supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle();
    if (existing.data) return NextResponse.json({ error: "Your business is already set up" }, { status: 409 });
    const parsed = businessSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid business details" }, { status: 400 });
    const input = parsed.data;
    let slug = slugify(input.slug || input.name);
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const { data, error } = await supabase.from("businesses").insert({
        owner_id: user.id,
        name: input.name,
        slug,
        logo_path: null,
        description: input.description || null,
        category: input.category || null,
        primary_color: input.primary_color,
        secondary_color: input.secondary_color,
        accent_color: input.accent_color,
        social_handle: input.social_handle || null,
        onboarding_completed: true,
      }).select("*").single();
      if (!error) return NextResponse.json({ business: data }, { status: 201 });
      if (!error.message.toLowerCase().includes("duplicate") && !error.message.toLowerCase().includes("unique")) throw error;
      slug = `${slugify(input.slug || input.name).slice(0, 58)}-${Math.random().toString(36).slice(2, 6)}`;
    }
    return NextResponse.json({ error: "We could not find an available public link. Try another slug." }, { status: 409 });
  } catch (error) {
    return NextResponse.json({ error: message(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "You must be signed in" }, { status: 401 });
    const parsed = businessSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid business details" }, { status: 400 });
    const input = parsed.data;
    const { data, error } = await supabase.from("businesses").update({
      name: input.name,
      slug: input.slug,
      description: input.description || null,
      category: input.category || null,
      primary_color: input.primary_color,
      secondary_color: input.secondary_color,
      accent_color: input.accent_color,
      social_handle: input.social_handle || null,
    }).eq("owner_id", user.id).select("*").single();
    if (error) throw error;
    return NextResponse.json({ business: data });
  } catch (error) {
    const detail = message(error);
    return NextResponse.json({ error: detail.toLowerCase().includes("unique") ? "That public link is already in use." : detail }, { status: 500 });
  }
}
