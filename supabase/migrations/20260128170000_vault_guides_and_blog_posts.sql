-- Vault guides: items shown under Guides/Digital Vault (Resources). Jeweler can add/edit/remove.
create table if not exists public.vault_guides (
  id text primary key,
  jeweler_id text not null default '',
  title text not null default '',
  description text not null default '',
  download_url text not null default '',
  suggested_filename text,
  tags jsonb not null default '[]',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vault_guides_jeweler_id on public.vault_guides(jeweler_id);
create index if not exists idx_vault_guides_sort on public.vault_guides(jeweler_id, sort_order);

alter table public.vault_guides enable row level security;
create policy "Public can read vault_guides" on public.vault_guides for select using (true);
create policy "Jeweler or legacy vault_guides"
  on public.vault_guides for all
  using (
    (auth.role() = 'authenticated' and jeweler_id = coalesce(auth.jwt() ->> 'email', ''))
    or (auth.role() = 'anon' and jeweler_id = '')
  )
  with check (
    (auth.role() = 'authenticated' and jeweler_id = coalesce(auth.jwt() ->> 'email', ''))
    or (auth.role() = 'anon' and jeweler_id = '')
  );

-- Blog posts: jeweler-written articles. published_at null = draft.
create table if not exists public.blog_posts (
  id text primary key,
  jeweler_id text not null default '',
  slug text not null,
  title text not null default '',
  meta_description text not null default '',
  category text not null default 'Guide',
  published_at timestamptz,
  read_time_minutes int not null default 5,
  excerpt text not null default '',
  body jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(jeweler_id, slug)
);

create index if not exists idx_blog_posts_jeweler_id on public.blog_posts(jeweler_id);
create index if not exists idx_blog_posts_published_at on public.blog_posts(published_at desc) where published_at is not null;
create index if not exists idx_blog_posts_slug on public.blog_posts(slug);

alter table public.blog_posts enable row level security;
create policy "Public can read blog_posts" on public.blog_posts for select using (true);
create policy "Jeweler or legacy blog_posts"
  on public.blog_posts for all
  using (
    (auth.role() = 'authenticated' and jeweler_id = coalesce(auth.jwt() ->> 'email', ''))
    or (auth.role() = 'anon' and jeweler_id = '')
  )
  with check (
    (auth.role() = 'authenticated' and jeweler_id = coalesce(auth.jwt() ->> 'email', ''))
    or (auth.role() = 'anon' and jeweler_id = '')
  );
