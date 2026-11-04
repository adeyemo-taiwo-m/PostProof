import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { firstName } from "@/lib/utils/slug";
import { testimonialSubmissionSchema } from "@/lib/validations/testimonial";
import { checkSubmissionRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 25_000) return NextResponse.json({ error: "Request is too large" }, { status: 413 });
  const source = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = await checkSubmissionRateLimit(source);
  if (!limit.allowed) return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  try {
    const parsed = testimonialSubmissionSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check your feedback" }, { status: 400 });
    const input = parsed.data;
    if (input.website) return NextResponse.json({ success: true });
    const admin = createAdminSupabaseClient();
    const { data: business, error: businessError } = await admin.from("businesses").select("id,name").eq("slug", input.slug).eq("onboarding_completed", true).maybeSingle();
    if (businessError || !business) return NextResponse.json({ error: "That testimonial link is no longer available." }, { status: 404 });
    const customerName = input.customer_name.trim();
    const displayName = !customerName || input.name_display === "anonymous" ? "Anonymous" : input.name_display === "first_name" ? firstName(customerName) : customerName;
    const { error } = await admin.from("testimonials").insert({ business_id: business.id, customer_name: customerName || null, display_name: displayName, name_display: input.name_display, testimonial_text: input.testimonial_text.trim(), marketing_consent: input.marketing_consent, consented_at: input.marketing_consent ? new Date().toISOString() : null, status: "pending" });
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("testimonial submission failed", error);
    return NextResponse.json({ error: "We could not send your feedback. Please try again." }, { status: 500 });
  }
}
