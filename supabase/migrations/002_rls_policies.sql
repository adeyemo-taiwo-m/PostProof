alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.testimonials enable row level security;
alter table public.generated_graphics enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "businesses_select_own" on public.businesses;
create policy "businesses_select_own" on public.businesses for select using (auth.uid() = owner_id);
drop policy if exists "businesses_insert_own" on public.businesses;
create policy "businesses_insert_own" on public.businesses for insert with check (auth.uid() = owner_id);
drop policy if exists "businesses_update_own" on public.businesses;
create policy "businesses_update_own" on public.businesses for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "testimonials_select_business_owner" on public.testimonials;
create policy "testimonials_select_business_owner" on public.testimonials for select using (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
);
drop policy if exists "testimonials_update_business_owner" on public.testimonials;
create policy "testimonials_update_business_owner" on public.testimonials for update using (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
) with check (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
);
drop policy if exists "testimonials_delete_business_owner" on public.testimonials;
create policy "testimonials_delete_business_owner" on public.testimonials for delete using (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
);

drop policy if exists "graphics_select_business_owner" on public.generated_graphics;
create policy "graphics_select_business_owner" on public.generated_graphics for select using (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
);
drop policy if exists "graphics_insert_business_owner" on public.generated_graphics;
create policy "graphics_insert_business_owner" on public.generated_graphics for insert with check (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  and exists (select 1 from public.testimonials t where t.id = testimonial_id and t.business_id = business_id)
);
