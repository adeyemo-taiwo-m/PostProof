import { z } from "zod";

export const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a six-digit HEX color");

export const businessSchema = z.object({
  name: z.string().trim().min(1, "Business name is required").max(100),
  slug: z.string().trim().min(3).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
  description: z.string().trim().max(280).nullable().optional(),
  category: z.string().trim().max(80).nullable().optional(),
  primary_color: hexColorSchema,
  secondary_color: hexColorSchema,
  accent_color: hexColorSchema,
  social_handle: z.string().trim().max(80).nullable().optional(),
});

export type BusinessInput = z.infer<typeof businessSchema>;
