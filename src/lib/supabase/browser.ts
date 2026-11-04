import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabasePublicEnv } from "@/lib/env";

let client: SupabaseClient<Database> | undefined;

export function createBrowserSupabaseClient() {
  if (!client) {
    const { url, anonKey } = getSupabasePublicEnv();
    client = createBrowserClient<Database>(url, anonKey);
  }
  return client;
}
