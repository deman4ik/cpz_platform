drop view vw_user_robot_profit_d;

create or replace view vw_user_robot_profit_d as
select
   p.user_id as uiduser_id,
   u.id as uiduser_robot_id,
   p.robot_id as nrobot_id,
   p.exchange as sexchange,
   p.asset as sasset,
   p.currency as scurrency,
   avg(p.exit_price) as ncurrate,
   date_trunc('day',exit_date) as dDATE,
   round(sum(p.profit/p.exit_price),8) as nprofit,
   sum(p.profit) as nprofit_c
from positions p, user_robot u, user_robot uu
where (u.robot_id = p.robot_id and u.user_id = p.user_id or
       u.linked_user_robot_id = u.id and uu.robot_id = p.robot_id and uu.user_id = p.user_id)
  and p.profit is not null
  and p.run_mode != 'backtest'
group by u.id, p.user_id, p.robot_id, p.exchange, p.asset, p.currency, date_trunc('day',exit_date);

alter table vw_user_robot_profit_d
  owner to cpz;

