drop view vw_user_robot_performance;

create or replace view vw_user_robot_performance as
select
    uiduser_id,
    uiduser_robot_id,
    nrobot_id,
    sexchange,
    sasset,
    scurrency,
    ncurrate,
    ddate,
    round(
         sum(p.nprofit) over (
           partition by uiduser_robot_id
           ORDER BY p.ddate asc
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
         )
    ,2) as nprofit,
    round(
         sum(p.nprofit_c) over (
           partition by uiduser_robot_id
           ORDER BY p.ddate asc
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
         )
    ,2) as nprofit_c
from vw_user_robot_profit_h p;

alter table vw_user_robot_performance
  owner to cpz;

