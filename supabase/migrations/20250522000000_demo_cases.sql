-- Demo persistence table: local demo only, not production-safe.
create table if not exists public.demo_cases (
  id text primary key,
  snapshot jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.demo_cases enable row level security;

drop policy if exists "demo read" on public.demo_cases;
drop policy if exists "demo insert" on public.demo_cases;
drop policy if exists "demo update" on public.demo_cases;

-- WARNING: These RLS policies are for local demo only and are not production-safe.
create policy "demo read"
  on public.demo_cases for select to anon using (true);

create policy "demo insert"
  on public.demo_cases for insert to anon with check (true);

create policy "demo update"
  on public.demo_cases for update to anon using (true) with check (true);
