import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Business } from "@/types/database";

export async function getUserOrRedirect() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function getOwnedBusinessOrRedirect() {
  const { supabase, user } = await getUserOrRedirect();
  const { data: business, error } = await supabase.from("businesses").select("*").eq("owner_id", user.id).maybeSingle();
  if (error) throw new Error("Unable to load your business profile");
  if (!business) redirect("/onboarding");
  return { supabase, user, business: business as Business };
}

export async function getPublicLogoUrl(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, logoPath: string | null) {
  if (!logoPath) return null;
  const { data } = await supabase.storage.from("business-logos").createSignedUrl(logoPath, 60 * 60);
  return data?.signedUrl ?? null;
}
