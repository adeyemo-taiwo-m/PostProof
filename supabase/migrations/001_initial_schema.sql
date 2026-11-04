create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  category text,
  logo_path text,
  primary_color text not null default '#14110F' check (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  secondary_color text not null default '#f5f4ef' check (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  accent_color text not null default '#F2542D' check (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  social_handle text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id)
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_name text,
  display_name text not null default 'Anonymous',
  name_display text not null default 'first_name' check (name_display in ('full_name', 'first_name', 'anonymous')),
  testimonial_text text not null check (char_length(testimonial_text) between 20 and 1000),
  marketing_consent boolean not null default false,
  consented_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((marketing_consent = false and consented_at is null) or (marketing_consent = true and consented_at is not null))
);

create table if not exists public.generated_graphics (
  id uuid primary key default gen_random_uuid(),
  testimonial_id uuid not null references public.testimonials(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  template text not null check (template in ('minimal', 'bold', 'editorial')),
  format text not null check (format in ('portrait', 'square', 'story')),
  storage_path text,
  created_at timestamptz not null default now()
);

create index if not exists businesses_owner_id_idx on public.businesses(owner_id);
create index if not exists businesses_slug_idx on public.businesses(slug);
create index if not exists testimonials_business_id_idx on public.testimonials(business_id);
create index if not exists testimonials_status_idx on public.testimonials(status);
create index if not exists testimonials_submitted_at_idx on public.testimonials(submitted_at desc);
create index if not exists generated_graphics_testimonial_id_idx on public.generated_graphics(testimonial_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at before update on public.businesses for each row execute procedure public.set_updated_at();
drop trigger if exists testimonials_set_updated_at on public.testimonials;
create trigger testimonials_set_updated_at before update on public.testimonials for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
