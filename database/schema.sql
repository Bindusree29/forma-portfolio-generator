create extension if not exists pgcrypto;

-- This app uses its own table so an existing portfolios table is left untouched.
create table if not exists public.forma_portfolios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,64}$'),
  name text not null check (char_length(name) between 1 and 100),
  headline text not null check (char_length(headline) between 1 and 160),
  bio text not null default '' check (char_length(bio) <= 1200),
  location text not null default '' check (char_length(location) <= 120),
  email text not null default '' check (char_length(email) <= 254),
  website text not null default '' check (char_length(website) <= 500),
  github text not null default '' check (char_length(github) <= 500),
  linkedin text not null default '' check (char_length(linkedin) <= 500),
  skills text not null default '' check (char_length(skills) <= 500),
  projects text not null default '' check (char_length(projects) <= 5000),
  edit_token_hash text not null check (edit_token_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists forma_portfolios_created_at_idx
  on public.forma_portfolios (created_at desc);

alter table public.forma_portfolios enable row level security;
revoke all on public.forma_portfolios from anon, authenticated;

create or replace function public.set_forma_portfolios_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists forma_portfolios_updated_at on public.forma_portfolios;
create trigger forma_portfolios_updated_at
before update on public.forma_portfolios
for each row execute function public.set_forma_portfolios_updated_at();
