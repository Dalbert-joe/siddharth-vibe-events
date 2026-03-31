create extension if not exists "uuid-ossp";

create table if not exists public.feedback (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  phone text not null,
  message text not null,
  created_at timestamptz default now()
);

alter table public.feedback enable row level security;

create policy "Anyone can submit feedback"
  on public.feedback for insert
  with check (true);

create policy "Only authenticated users can read feedback"
  on public.feedback for select
  using (auth.role() = 'authenticated');
