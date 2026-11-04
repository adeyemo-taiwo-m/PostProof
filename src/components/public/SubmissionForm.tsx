"use client";

import { useState } from "react";

export function SubmissionForm({ slug, businessName }: { slug: string; businessName: string }) {
  const [form, setForm] = useState({ testimonial_text: "", customer_name: "", name_display: "first_name", marketing_consent: false, website: "" });
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("submitting"); setError("");
    const response = await fetch("/api/testimonials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, slug }) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setState("error"); setError(result.error ?? "Please try again."); return; }
    setState("success");
  }
  if (state === "success") return <div className="submission-success"><span className="success-mark">✓</span><h2>Thank you for sharing your experience!</h2><p>Your feedback has been sent to {businessName}.</p></div>;
  return <form className="submission-form" onSubmit={submit}><label>Tell us about your experience<textarea value={form.testimonial_text} onChange={(event) => setForm({ ...form, testimonial_text: event.target.value })} minLength={20} maxLength={1000} rows={7} placeholder="What stood out about working with us?" required /></label><div className="char-count">{form.testimonial_text.length}/1,000</div><label>Your name <span className="optional">optional</span><input value={form.customer_name} onChange={(event) => setForm({ ...form, customer_name: event.target.value })} maxLength={80} placeholder="Jane Doe" /></label><fieldset><legend>How should your name appear?</legend><label className="choice"><input type="radio" checked={form.name_display === "first_name"} onChange={() => setForm({ ...form, name_display: "first_name" })} /> First name only</label><label className="choice"><input type="radio" checked={form.name_display === "full_name"} onChange={() => setForm({ ...form, name_display: "full_name" })} /> Full name</label><label className="choice"><input type="radio" checked={form.name_display === "anonymous"} onChange={() => setForm({ ...form, name_display: "anonymous" })} /> Anonymous</label></fieldset><label className="consent"><input type="checkbox" checked={form.marketing_consent} onChange={(event) => setForm({ ...form, marketing_consent: event.target.checked })} /> <span>I give {businessName} permission to use this testimonial in its marketing materials, including social media posts and promotional graphics.</span></label><input className="honeypot" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} aria-hidden="true" />{error && <p className="form-message error">{error}</p>}<button className="button button-dark button-full" type="submit" disabled={state === "submitting"}>{state === "submitting" ? "Sending…" : "Submit testimonial"}</button></form>;
}
