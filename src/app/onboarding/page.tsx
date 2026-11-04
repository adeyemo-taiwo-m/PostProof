import { redirect } from "next/navigation";
import Link from "next/link";
import { BusinessForm } from "@/components/dashboard/BusinessForm";
import { getUserOrRedirect } from "@/lib/server-context";

export default async function OnboardingPage() {
  const { supabase, user } = await getUserOrRedirect();
  const { data: business } = await supabase.from("businesses").select("*").eq("owner_id", user.id).maybeSingle();
  if (business?.onboarding_completed) redirect("/dashboard");
  return <main className="setup-page"><div className="setup-brand"><Link className="wordmark" href="/"><span className="wordmark-mark">“</span><span className="wordmark-name"><span>Proof</span><span className="wordmark-card-text">Card</span></span></Link></div><section className="setup-card"><div className="kicker">First, make it yours</div><h1>Set up your studio.</h1><p>These details shape the link your customers see and the graphics you share later.</p><BusinessForm existing={business} onboarding /></section></main>;
}
