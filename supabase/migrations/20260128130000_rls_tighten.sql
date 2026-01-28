-- Tighten RLS: restrict by jeweler_id vs auth.
-- - Authenticated: only rows where jeweler_id = auth.jwt() ->> 'email'
-- - Anon: only rows where jeweler_id = '' (legacy/demo)
-- Production: jeweler signs in with Supabase auth; their email is used as jeweler_id (set in app via setEffectiveJewelerId).
-- Demo / env-only: use jeweler_id = '' so anon can read/write; set VITE_JEWELER_EMAIL to '' or leave unset and sign out.

-- designs
drop policy if exists "Allow all for designs" on public.designs;
create policy "Jeweler or legacy designs"
  on public.designs for all
  using (
    (auth.role() = 'authenticated' and jeweler_id = coalesce(auth.jwt() ->> 'email', ''))
    or (auth.role() = 'anon' and jeweler_id = '')
  )
  with check (
    (auth.role() = 'authenticated' and jeweler_id = coalesce(auth.jwt() ->> 'email', ''))
    or (auth.role() = 'anon' and jeweler_id = '')
  );

-- leads
drop policy if exists "Allow all for leads" on public.leads;
create policy "Jeweler or legacy leads"
  on public.leads for all
  using (
    (auth.role() = 'authenticated' and jeweler_id = coalesce(auth.jwt() ->> 'email', ''))
    or (auth.role() = 'anon' and jeweler_id = '')
  )
  with check (
    (auth.role() = 'authenticated' and jeweler_id = coalesce(auth.jwt() ->> 'email', ''))
    or (auth.role() = 'anon' and jeweler_id = '')
  );

-- catalog_products
drop policy if exists "Allow all for catalog_products" on public.catalog_products;
create policy "Jeweler or legacy catalog"
  on public.catalog_products for all
  using (
    (auth.role() = 'authenticated' and jeweler_id = coalesce(auth.jwt() ->> 'email', ''))
    or (auth.role() = 'anon' and jeweler_id = '')
  )
  with check (
    (auth.role() = 'authenticated' and jeweler_id = coalesce(auth.jwt() ->> 'email', ''))
    or (auth.role() = 'anon' and jeweler_id = '')
  );

-- email_flows (only if the table exists; it is created in 20260128120000_email_flows.sql)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_flows') THEN
    DROP POLICY IF EXISTS "Allow all for email_flows" ON public.email_flows;
    CREATE POLICY "Jeweler or legacy email_flows"
      ON public.email_flows FOR ALL
      USING (
        (auth.role() = 'authenticated' AND jeweler_id = coalesce(auth.jwt() ->> 'email', ''))
        OR (auth.role() = 'anon' AND jeweler_id = '')
      )
      WITH CHECK (
        (auth.role() = 'authenticated' AND jeweler_id = coalesce(auth.jwt() ->> 'email', ''))
        OR (auth.role() = 'anon' AND jeweler_id = '')
      );
  END IF;
END $$;
