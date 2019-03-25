drop view vw_user_robot_performance_total;

create view vw_user_robot_performance_total as
select
p.user_id as uiduser_id, exit_date::date as dDATE, sum(p.profit*r.ncurrate) as nprofit
from positions p, user_robot u, user_robot uu,
     (select 4012 as nCURRATE, '$' as sCURCODE) r
where (u.robot_id = p.robot_id and u.user_id = p.user_id or
       u.linked_user_robot_id = u.id and uu.robot_id = p.robot_id and uu.user_id = p.user_id)
  and p.profit is not null
  --and p.backtest_id is null
  and p.run_mode != 'backtest'
group by p.user_id, exit_date::date;

alter table vw_user_robot_performance_total
  owner to cpz;

