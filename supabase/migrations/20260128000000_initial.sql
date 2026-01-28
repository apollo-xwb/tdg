-- Designs/orders (full config as JSONB)
create table if not exists public.designs (
  id text primary key,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- Leads
create table if not exists public.leads (
  id text primary key,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- Realtime for client sync when jeweler updates (idempotent: skip if already in publication)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'designs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.designs;
  END IF;
END $$;

-- RLS: allow anon read/write for demo (tighten in production with auth)
alter table public.designs enable row level security;
alter table public.leads enable row level security;

drop policy if exists "Allow all for designs" on public.designs;
create policy "Allow all for designs" on public.designs for all using (true) with check (true);

drop policy if exists "Allow all for leads" on public.leads;
create policy "Allow all for leads" on public.leads for all using (true) with check (true);
