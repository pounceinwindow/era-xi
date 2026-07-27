create or replace view public.all_time_leaderboard
with (security_invoker = false)
as
select
  ranked.nickname,
  ranked.score,
  ranked.stage,
  ranked.goal_difference,
  ranked.formation,
  ranked.completed_at
from (
  select
    p.nickname,
    r.score,
    r.stage,
    r.goal_difference,
    r.formation,
    r.completed_at,
    row_number() over (
      partition by r.user_id
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
    ) as user_place
  from public.daily_runs r
  join public.profiles p on p.user_id = r.user_id
) ranked
where ranked.user_place = 1
order by
  ranked.score desc,
  case ranked.stage
    when 'champion' then 6
    when 'final' then 5
    when 'sf' then 4
    when 'qf' then 3
    when 'r16' then 2
    else 1
  end desc,
  ranked.goal_difference desc,
  ranked.completed_at asc
limit 100;

grant select on public.all_time_leaderboard to anon, authenticated;
