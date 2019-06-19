drop view vw_user_robot_performance_d;

create or replace view vw_user_robot_performance_d as
select
    uiduser_id,
    uiduser_robot_id,
    nrobot_id,
    sexchange,
    sasset,
    scurrency,
    ncurrate,
    ddate as ddate,
    round(
         sum(p.nprofit_c) over (
           partition by uiduser_robot_id
           ORDER BY p.ddate asc
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
         )
    ,2) as nprofit_c,
    round(
         sum(p.nprofit) over (
           partition by uiduser_robot_id
           ORDER BY p.ddate asc
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
         )
    ,2) as nprofit
from vw_user_robot_profit_d p;

alter table vw_user_robot_performance_d
  owner to cpz;

