-- Email flows: jeweler-configured templates for quote approved, status updates, reminders, promos
create table if not exists public.email_flows (
  id text primary key,
  jeweler_id text not null default '',
  name text not null default '',
  trigger_type text not null default 'custom',
  subject_template text not null default '',
  body_template text not null default '',
  follow_up_days int,
  is_active boolean not null default true,
  follow_ups jsonb default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_email_flows_jeweler_id on public.email_flows(jeweler_id);
create index if not exists idx_email_flows_updated_at on public.email_flows(updated_at desc);

alter table public.email_flows enable row level security;
create policy "Allow all for email_flows" on public.email_flows for all using (true) with check (true);

-- Realtime for email_flows (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'email_flows') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.email_flows;
  END IF;
END $$;
