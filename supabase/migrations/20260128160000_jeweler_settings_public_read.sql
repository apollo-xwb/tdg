-- Allow anyone to read jeweler_settings so the footer and booking page can show
-- operational hours (and other store-level config) without requiring auth.
create policy "Public can read jeweler_settings"
  on public.jeweler_settings for select using (true);
