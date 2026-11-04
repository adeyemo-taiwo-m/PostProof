const FALLBACK_URL = "https://placeholder.supabase.co";
const FALLBACK_KEY = "placeholder-anon-key";

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabasePublicEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? FALLBACK_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? FALLBACK_KEY,
  };
}

export function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
