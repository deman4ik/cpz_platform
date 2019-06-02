drop view vw_user_robot_profit_d;

create or replace view vw_user_robot_profit_d as
select
   p.user_id as uiduser_id,
   u.id as uiduser_robot_id,
   p.robot_id as nrobot_id,
   p.exchange as sexchange,
   p.asset as sasset,
   p.currency as scurrency,
   r.currate as ncurrate,
   date_trunc('date',exit_date)::date as dDATE,
   round(sum(p.profit/r.currate),8) as nprofit,
   sum(p.profit) as nprofit_c
from positions p, user_robot u, user_robot uu,
     v_currate_c r
where (u.robot_id = p.robot_id and u.user_id = p.user_id or
       u.linked_user_robot_id = u.id and uu.robot_id = p.robot_id and uu.user_id = p.user_id)
  and p.profit is not null
  and p.run_mode != 'backtest'
  and p.exchange = r.exchange and p.currency = r.currency and p.asset = r.asset
group by u.id, p.user_id, p.robot_id, p.exchange, p.asset, p.currency, r.currate, date_trunc('date',exit_date)::date;

alter table vw_user_robot_profit_d
  owner to cpz;

