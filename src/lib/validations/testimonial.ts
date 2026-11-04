import { z } from "zod";

export const testimonialSubmissionSchema = z.object({
  slug: z.string().trim().min(1).max(80),
  testimonial_text: z.string().trim().min(20, "Please share at least 20 characters").max(1000, "Please keep your feedback under 1,000 characters"),
  customer_name: z.string().trim().max(80).optional().default(""),
  name_display: z.enum(["full_name", "first_name", "anonymous"]).default("first_name"),
  marketing_consent: z.boolean().default(false),
  website: z.string().max(200).optional().default(""),
});

export const testimonialStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

export type TestimonialSubmission = z.infer<typeof testimonialSubmissionSchema>;
