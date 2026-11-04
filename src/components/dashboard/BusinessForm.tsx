"use client";

import { useState } from "react";
import { slugify } from "@/lib/utils/slug";
import type { Business } from "@/types/database";

type FormState = Pick<Business, "name" | "slug" | "description" | "category" | "primary_color" | "secondary_color" | "accent_color" | "social_handle">;
const defaults: FormState = { name: "", slug: "", description: "", category: "", primary_color: "#14110F", secondary_color: "#f5f4ef", accent_color: "#F2542D", social_handle: "" };

export function BusinessForm({ existing, onboarding = false }: { existing?: Business | null; onboarding?: boolean }) {
  const [form, setForm] = useState<FormState>(existing ? { name: existing.name, slug: existing.slug, description: existing.description ?? "", category: existing.category ?? "", primary_color: existing.primary_color, secondary_color: existing.secondary_color, accent_color: existing.accent_color, social_handle: existing.social_handle ?? "" } : defaults);
  const [slugEdited, setSlugEdited] = useState(Boolean(existing));
  const [logo, setLogo] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  function update(key: keyof FormState, value: string) { setForm((current) => ({ ...current, [key]: value })); }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setMessage(null);
    const response = await fetch("/api/business", { method: existing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const result = await response.json() as { business?: Business; error?: string };
    if (!response.ok || !result.business) { setMessage({ type: "error", text: result.error ?? "Could not save your profile." }); setLoading(false); return; }
    if (logo) {
      const body = new FormData(); body.append("logo", logo);
      const upload = await fetch("/api/business/logo", { method: "POST", body });
      if (!upload.ok) { setMessage({ type: "error", text: "Profile saved, but the logo could not be uploaded." }); setLoading(false); return; }
    }
    setMessage({ type: "success", text: existing ? "Your brand profile is updated." : "Your studio is ready." });
    setLoading(false);
    if (onboarding) window.location.href = "/dashboard";
  }

  return <form className="profile-form" onSubmit={submit}>
    <div className="form-grid"><label>Business name<input value={form.name} onChange={(event) => { const name = event.target.value; setForm((current) => ({ ...current, name, ...(slugEdited ? {} : { slug: slugify(name) }) })); }} placeholder="Moonwell Studio" required /></label><label>Category <span className="optional">optional</span><input value={form.category ?? ""} onChange={(event) => update("category", event.target.value)} placeholder="Brand design" /></label></div>
    <label>Public link <span className="optional">testimonials.yourstudio.com/t/</span><input value={form.slug} onChange={(event) => { setSlugEdited(true); update("slug", slugify(event.target.value)); }} placeholder="moonwell-studio" required /><small>Use lowercase letters, numbers and hyphens. You can change this later.</small></label>
    <label>Short description <span className="optional">optional</span><textarea value={form.description ?? ""} onChange={(event) => update("description", event.target.value)} placeholder="A little context about the work you do." maxLength={280} rows={3} /></label>
    <label>Social handle <span className="optional">optional</span><input value={form.social_handle ?? ""} onChange={(event) => update("social_handle", event.target.value)} placeholder="@moonwellstudio" /></label>
    <div className="color-grid">{([ ["primary_color", "Primary color"], ["secondary_color", "Secondary color"], ["accent_color", "Accent color"] ] as const).map(([key, label]) => <label key={key}>{label}<span className="color-input"><input type="color" value={form[key]} onChange={(event) => update(key, event.target.value)} /><input value={form[key]} onChange={(event) => update(key, event.target.value)} pattern="^#[0-9a-fA-F]{6}$" /></span></label>)}</div>
    <label>Logo <span className="optional">PNG, JPG or WebP · max 2 MB</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setLogo(event.target.files?.[0] ?? null)} /></label>
    {message && <p className={`form-message ${message.type}`}>{message.text}</p>}
    <button className="button button-dark" type="submit" disabled={loading}>{loading ? "Saving…" : onboarding ? "Create my studio" : "Save changes"}</button>
  </form>;
}
