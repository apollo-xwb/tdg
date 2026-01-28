-- Jeweler settings: plan tier and feature toggles (e.g. Live Diamond Sourcing / Nivoda).
-- package_tier drives paywall: 'starter' | 'growth' | 'pro'. Growth and Pro include Nivoda.
create table if not exists public.jeweler_settings (
  jeweler_id text primary key,
  package_tier text not null default 'starter' check (package_tier in ('starter', 'growth', 'pro')),
  settings jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create index if not exists idx_jeweler_settings_updated_at on public.jeweler_settings(updated_at desc);

comment on column public.jeweler_settings.settings is 'Feature flags and prefs, e.g. {"nivodaSourcingEnabled": true}';
comment on column public.jeweler_settings.package_tier is 'starter = no Nivoda; growth, pro = can enable Live Diamond Sourcing';

alter table public.jeweler_settings enable row level security;

create policy "Jeweler or legacy jeweler_settings"
  on public.jeweler_settings for all
  using (
    (auth.role() = 'authenticated' AND jeweler_id = coalesce(auth.jwt() ->> 'email', ''))
    OR (auth.role() = 'anon' AND jeweler_id = '')
  )
  with check (
    (auth.role() = 'authenticated' AND jeweler_id = coalesce(auth.jwt() ->> 'email', ''))
    OR (auth.role() = 'anon' AND jeweler_id = '')
  );
