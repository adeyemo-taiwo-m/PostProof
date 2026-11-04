import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getServiceRoleKey, getSupabasePublicEnv } from "@/lib/env";

export function createAdminSupabaseClient() {
  const serviceRoleKey = getServiceRoleKey();
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  const { url } = getSupabasePublicEnv();
  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
