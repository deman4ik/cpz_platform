drop view vw_user_robot_performance_total;

create view vw_user_robot_performance_total as
select
p.user_id as uiduser_id, exit_date::date as dDATE, sum(p.profit) as nprofit
from positions p, user_robot u
where u.robot_id = p.robot_id and u.user_id = p.user_id
  and p.profit is not null
  --and p.backtest_id is null
  and run_mode != 'backtest'
group by p.user_id, exit_date::date;

alter table vw_user_robot_performance_total
  owner to cpz;

