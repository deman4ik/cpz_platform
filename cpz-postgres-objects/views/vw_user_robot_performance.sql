drop view vw_user_robot_performance;

create view vw_user_robot_performance as
select
p.user_id as uiduser_id, u.id as uiduser_robot_id, p.robot_id as nrobot_id, exchange as sexchange, asset as sasset, currency as scurrency, date_trunc('day',exit_date) as dDATE, sum(p.profit) as nprofit
from positions p, user_robot u
where u.robot_id = p.robot_id and u.user_id = p.user_id
  and p.profit is not null
  and p.backtest_id is null
  -- and run_mode = 'realtime'
group by u.id, p.user_id, p.robot_id, p.exchange, p.asset, p.currency, date_trunc('day',p.exit_date);

alter table vw_user_robot_performance
  owner to cpz;

