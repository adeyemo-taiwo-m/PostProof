"use client";

import { LogOut } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui";

export function DashboardSignOut({ compact = false }: { compact?: boolean }) {
  async function signOut() { await createBrowserSupabaseClient().auth.signOut(); window.location.href = "/login"; }
  if (compact) return <Button variant="ghost" size="icon" onClick={signOut} aria-label="Log out" leftIcon={<LogOut />} />;
  return <Button variant="ghost" className="side-signout" onClick={signOut} aria-label="Log out" leftIcon={<LogOut />}>Log out</Button>;
}
