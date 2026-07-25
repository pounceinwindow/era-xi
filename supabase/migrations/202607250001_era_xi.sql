create extension if not exists pgcrypto;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (nickname ~ '^[[:alnum:]А-Яа-яЁё_-]{3,16}$'),
  updated_at timestamptz not null default now()
);

create table public.daily_challenges (
  id uuid primary key default gen_random_uuid(),
  challenge_date date not null unique,
  seed text not null unique,
  created_at timestamptz not null default now()
);

create table public.daily_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id uuid not null references public.daily_challenges(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, challenge_id)
);

create table public.daily_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id uuid not null references public.daily_challenges(id) on delete cascade,
  formation text not null check (formation in ('4-3-3','4-2-3-1','4-4-2','3-5-2')),
  stage text not null check (stage in ('group','r16','qf','sf','final','champion')),
  score integer not null check (score >= 0),
  goal_difference integer not null,
  run_payload jsonb not null,
  completed_at timestamptz not null default now(),
  unique (user_id, challenge_id)
);

alter table public.profiles enable row level security;
alter table public.daily_challenges enable row level security;
alter table public.daily_attempts enable row level security;
alter table public.daily_runs enable row level security;

create policy "Users can read their profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can read today's challenge" on public.daily_challenges
  for select to authenticated using (challenge_date = (now() at time zone 'utc')::date);
create policy "Users can read their attempt" on public.daily_attempts
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can read their run" on public.daily_runs
  for select to authenticated using ((select auth.uid()) = user_id);

create or replace view public.daily_leaderboard
with (security_invoker = false)
as
select
  c.challenge_date,
  p.nickname,
  r.score,
  r.stage,
  r.goal_difference,
  r.formation,
  r.completed_at
from public.daily_runs r
join public.profiles p on p.user_id = r.user_id
join public.daily_challenges c on c.id = r.challenge_id
where c.challenge_date = (now() at time zone 'utc')::date
order by
  r.score desc,
  case r.stage
    when 'champion' then 6
    when 'final' then 5
    when 'sf' then 4
    when 'qf' then 3
    when 'r16' then 2
    else 1
  end desc,
  r.goal_difference desc,
  r.completed_at asc
limit 100;

revoke all on public.profiles, public.daily_challenges, public.daily_attempts, public.daily_runs from anon, authenticated;
grant select on public.daily_leaderboard to anon, authenticated;
