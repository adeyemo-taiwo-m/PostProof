"use client";

import { LogOut } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function DashboardSignOut({ compact = false }: { compact?: boolean }) {
  async function signOut() { await createBrowserSupabaseClient().auth.signOut(); window.location.href = "/login"; }
  return <button className={compact ? "icon-button" : "side-signout"} onClick={signOut} type="button" aria-label="Log out"><LogOut size={16} />{!compact && "Log out"}</button>;
}
