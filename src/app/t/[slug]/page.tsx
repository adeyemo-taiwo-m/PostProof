import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { SubmissionForm } from "@/components/public/SubmissionForm";

export const dynamic = "force-dynamic";

export default async function PublicTestimonialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const admin = createAdminSupabaseClient();
  const { data: business } = await admin.from("businesses").select("id,name,description,category,logo_path,primary_color,secondary_color,accent_color,social_handle").eq("slug", slug).eq("onboarding_completed", true).maybeSingle();
  if (!business) notFound();
  let logoUrl: string | null = null;
  if (business.logo_path) logoUrl = (await admin.storage.from("business-logos").createSignedUrl(business.logo_path, 3600)).data?.signedUrl ?? null;
  const publicStyle = { "--public-primary": business.primary_color, "--public-secondary": business.secondary_color, "--public-accent": business.accent_color } as React.CSSProperties;
  return <main className="public-page" style={publicStyle}><div className="public-card"><div className="public-brand">{logoUrl ? <img src={logoUrl} alt="" /> : <span className="public-logo">{business.name.slice(0, 1)}</span>}<span>{business.name}</span></div><div className="public-intro"><div className="kicker">A note from you</div><h1>We&apos;d love to hear about your experience.</h1><p>Your feedback helps us improve and helps others understand what it&apos;s like to work with us.</p></div><SubmissionForm slug={slug} businessName={business.name} /><p className="public-foot">Powered by Postproof · Your feedback stays with {business.name}.</p></div></main>;
}
