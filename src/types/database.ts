export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Business = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  logo_path: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  social_handle: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type TestimonialStatus = "pending" | "approved" | "rejected";
export type NameDisplay = "full_name" | "first_name" | "anonymous";

export type Testimonial = {
  id: string;
  business_id: string;
  customer_name: string | null;
  display_name: string;
  testimonial_text: string;
  marketing_consent: boolean;
  consented_at: string | null;
  status: TestimonialStatus;
  name_display: NameDisplay;
  submitted_at: string;
  updated_at: string;
};

export type GeneratedGraphic = {
  id: string;
  testimonial_id: string;
  business_id: string;
  template: GraphicTemplate;
  format: GraphicFormat;
  storage_path: string | null;
  created_at: string;
};

export type GraphicFormat = "portrait" | "square" | "story";
export type GraphicTemplate = "minimal" | "bold" | "editorial";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string | null; email: string | null; created_at: string; updated_at: string };
        Insert: { id: string; full_name?: string | null; email?: string | null; created_at?: string; updated_at?: string };
        Update: { full_name?: string | null; email?: string | null; updated_at?: string };
        Relationships: [];
      };
      businesses: {
        Row: Business;
        Insert: Omit<Business, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<Business, "id" | "owner_id" | "created_at" | "updated_at">> & { updated_at?: string };
        Relationships: [];
      };
      testimonials: {
        Row: Testimonial;
        Insert: Omit<Testimonial, "id" | "submitted_at" | "updated_at" | "consented_at"> & {
          id?: string;
          submitted_at?: string;
          updated_at?: string;
          consented_at?: string | null;
        };
        Update: Partial<Pick<Testimonial, "status" | "customer_name" | "display_name" | "testimonial_text" | "marketing_consent" | "consented_at" | "name_display">> & { updated_at?: string };
        Relationships: [];
      };
      generated_graphics: {
        Row: GeneratedGraphic;
        Insert: Omit<GeneratedGraphic, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Pick<GeneratedGraphic, "storage_path">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };
