-- Jeweler inventory / catalog: products shown to clients, clients can enquire on a specific design
create table if not exists public.catalog_products (
  id text primary key,
  jeweler_id text not null default '',
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create index if not exists idx_catalog_products_jeweler_id on public.catalog_products(jeweler_id);
create index if not exists idx_catalog_products_updated_at on public.catalog_products(updated_at desc);

alter table public.catalog_products enable row level security;
create policy "Allow all for catalog_products" on public.catalog_products for all using (true) with check (true);

-- designs/leads: add jeweler_id for multi-tenant (nullable for backward compat)
alter table public.designs add column if not exists jeweler_id text default '';
alter table public.leads add column if not exists jeweler_id text default '';
