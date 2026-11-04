insert into storage.buckets (id, name, public)
values ('business-logos', 'business-logos', false), ('testimonial-graphics', 'testimonial-graphics', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists "business_logo_owner_read" on storage.objects;
create policy "business_logo_owner_read" on storage.objects for select to authenticated using (
  bucket_id = 'business-logos'
  and (storage.foldername(name))[1] = 'businesses'
  and exists (select 1 from public.businesses b where b.id::text = (storage.foldername(name))[2] and b.owner_id = auth.uid())
);
drop policy if exists "business_logo_owner_insert" on storage.objects;
create policy "business_logo_owner_insert" on storage.objects for insert to authenticated with check (
  bucket_id = 'business-logos'
  and (storage.foldername(name))[1] = 'businesses'
  and exists (select 1 from public.businesses b where b.id::text = (storage.foldername(name))[2] and b.owner_id = auth.uid())
);
drop policy if exists "business_logo_owner_update" on storage.objects;
create policy "business_logo_owner_update" on storage.objects for update to authenticated using (
  bucket_id = 'business-logos'
  and (storage.foldername(name))[1] = 'businesses'
  and exists (select 1 from public.businesses b where b.id::text = (storage.foldername(name))[2] and b.owner_id = auth.uid())
);
drop policy if exists "business_logo_owner_delete" on storage.objects;
create policy "business_logo_owner_delete" on storage.objects for delete to authenticated using (
  bucket_id = 'business-logos'
  and (storage.foldername(name))[1] = 'businesses'
  and exists (select 1 from public.businesses b where b.id::text = (storage.foldername(name))[2] and b.owner_id = auth.uid())
);

drop policy if exists "graphic_owner_read" on storage.objects;
create policy "graphic_owner_read" on storage.objects for select to authenticated using (
  bucket_id = 'testimonial-graphics'
  and (storage.foldername(name))[1] = 'businesses'
  and exists (select 1 from public.businesses b where b.id::text = (storage.foldername(name))[2] and b.owner_id = auth.uid())
);
