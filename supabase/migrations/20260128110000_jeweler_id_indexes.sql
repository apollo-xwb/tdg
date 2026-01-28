-- Multi-tenant: index jeweler_id on designs and leads for fast tenant-scoped queries
create index if not exists idx_designs_jeweler_id on public.designs(jeweler_id);
create index if not exists idx_leads_jeweler_id on public.leads(jeweler_id);
