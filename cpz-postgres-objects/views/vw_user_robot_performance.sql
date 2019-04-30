drop view vw_user_robot_performance;

create or replace view vw_user_robot_performance as
select
p.user_id as uiduser_id, u.id as uiduser_robot_id, p.robot_id as nrobot_id, exchange as sexchange, asset as sasset, currency as scurrency, exit_date::date as dDATE,
round(sum(p.profit/r.nCURRATE),8) as nprofit, sum(p.profit) as nprofit_c
from positions p, user_robot u, user_robot uu,
     (select 5143 as nCURRATE, '$' as sCURCODE) r
where (u.robot_id = p.robot_id and u.user_id = p.user_id or
       u.linked_user_robot_id = u.id and uu.robot_id = p.robot_id and uu.user_id = p.user_id)
  and p.profit is not null
  --and p.backtest_id is null
  and p.run_mode != 'backtest'
group by u.id, p.user_id, p.robot_id, p.exchange, p.asset, p.currency, exit_date::date;

alter table vw_user_robot_performance
  owner to cpz;

