"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type AuthMode = "login" | "signup" | "forgot" | "reset";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    if (mode === "reset" && password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    let error: { message: string } | null = null;

    if (mode === "login") {
      ({ error } = await supabase.auth.signInWithPassword({ email, password }));
      if (!error) router.push(new URLSearchParams(window.location.search).get("next") || "/dashboard");
    } else if (mode === "signup") {
      const result = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      error = result.error;
      if (!error) {
        if (result.data.session) router.push("/onboarding");
        else setStatus({ type: "success", message: "Check your email to confirm your account, then come back to log in." });
      }
    } else if (mode === "forgot") {
      ({ error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }));
      if (!error) setStatus({ type: "success", message: "If an account exists for that email, a reset link is on its way." });
    } else {
      ({ error } = await supabase.auth.updateUser({ password }));
      if (!error) {
        setStatus({ type: "success", message: "Your password has been updated." });
        setTimeout(() => router.push("/dashboard"), 700);
      }
    }

    if (error) setStatus({ type: "error", message: error.message });
    setLoading(false);
  }

  return (
    <form className="stack-form" onSubmit={onSubmit}>
      {mode === "signup" && <label>Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" placeholder="Ayo Adeyemi" required /></label>}
      {mode !== "reset" && <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" required /></label>}
      {mode !== "forgot" && <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="At least 8 characters" minLength={8} required /></label>}
      {mode === "reset" && <label>Confirm password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" placeholder="Repeat your password" minLength={8} required /></label>}
      {status && <p className={`form-message ${status.type}`}>{status.message}</p>}
      <button className="button button-dark button-full" type="submit" disabled={loading}>{loading ? "Working…" : mode === "login" ? "Log in" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Update password"}</button>
      {mode === "login" && <div className="form-links"><Link href="/forgot-password">Forgot your password?</Link><span>New here? <Link href="/signup">Create an account</Link></span></div>}
      {mode === "signup" && <p className="form-footnote">Already have an account? <Link href="/login">Log in</Link></p>}
      {mode === "forgot" && <p className="form-footnote"><Link href="/login">Back to log in</Link></p>}
    </form>
  );
}
