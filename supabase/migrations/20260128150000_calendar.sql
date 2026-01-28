-- Jeweler availability: recurring weekly windows (e.g. Mon 9–12, Mon 14–17).
-- day_of_week 0 = Sunday, 6 = Saturday. start_time/end_time as HH:MM.
create table if not exists public.jeweler_availability (
  id text primary key,
  jeweler_id text not null default '',
  day_of_week int not null check (day_of_week >= 0 and day_of_week <= 6),
  start_time text not null,
  end_time text not null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_jeweler_availability_jeweler_id on public.jeweler_availability(jeweler_id);

-- Appointments: who, when, meeting summary. Clients can create; jeweler manages.
create table if not exists public.appointments (
  id text primary key,
  jeweler_id text not null default '',
  start_at timestamptz not null,
  end_at timestamptz not null,
  client_name text not null default '',
  client_email text not null default '',
  summary text not null default '',
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'no_show')),
  design_id text,
  lead_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_appointments_jeweler_id on public.appointments(jeweler_id);
create index if not exists idx_appointments_start_at on public.appointments(start_at);

alter table public.jeweler_availability enable row level security;
alter table public.appointments enable row level security;

-- Availability: jeweler can manage own; anyone can read (for client booking page).
create policy "Jeweler or legacy availability"
  on public.jeweler_availability for all
  using (
    (auth.role() = 'authenticated' AND jeweler_id = coalesce(auth.jwt() ->> 'email', ''))
    OR (auth.role() = 'anon' AND jeweler_id = '')
  )
  with check (
    (auth.role() = 'authenticated' AND jeweler_id = coalesce(auth.jwt() ->> 'email', ''))
    OR (auth.role() = 'anon' AND jeweler_id = '')
  );
create policy "Anyone can read availability for booking"
  on public.jeweler_availability for select using (true);

-- Appointments: jeweler can read/update/delete own; anyone can insert (client booking).
create policy "Jeweler appointments read write"
  on public.appointments for all
  using (
    (auth.role() = 'authenticated' AND jeweler_id = coalesce(auth.jwt() ->> 'email', ''))
    OR (auth.role() = 'anon' AND jeweler_id = '')
  )
  with check (
    (auth.role() = 'authenticated' AND jeweler_id = coalesce(auth.jwt() ->> 'email', ''))
    OR (auth.role() = 'anon' AND jeweler_id = '')
  );

-- Allow anon to insert appointments so clients can book (jeweler_id from app context).
create policy "Client can book appointment"
  on public.appointments for insert
  with check (true);

-- Allow anyone to read appointments so the booking page can compute free slots.
create policy "Anyone can read appointments for slots"
  on public.appointments for select using (true);
