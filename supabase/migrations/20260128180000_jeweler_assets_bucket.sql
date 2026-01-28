-- Storage bucket for jeweler uploads (logos, guide files). Public read so clients can load logos and download guides.
-- Run this migration only if storage.buckets exists (Supabase projects have it by default).
insert into storage.buckets (id, name, public)
values ('jeweler-assets', 'jeweler-assets', true)
on conflict (id) do update set public = true;

-- Policies: public read; allow inserts/updates/deletes for the bucket (restrict by path in app or add stricter RLS later).
drop policy if exists "Public read jeweler-assets" on storage.objects;
create policy "Public read jeweler-assets"
  on storage.objects for select
  using (bucket_id = 'jeweler-assets');

drop policy if exists "Allow upload jeweler-assets" on storage.objects;
create policy "Allow upload jeweler-assets"
  on storage.objects for insert
  with check (bucket_id = 'jeweler-assets');

drop policy if exists "Allow update jeweler-assets" on storage.objects;
create policy "Allow update jeweler-assets"
  on storage.objects for update
  using (bucket_id = 'jeweler-assets');

drop policy if exists "Allow delete jeweler-assets" on storage.objects;
create policy "Allow delete jeweler-assets"
  on storage.objects for delete
  using (bucket_id = 'jeweler-assets');
