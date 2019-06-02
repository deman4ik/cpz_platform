drop view vw_user_robot_performance_total;

create or replace view vw_user_robot_performance_total as
select
    uiduser_id,
    ddate,
    sum(nprofit_c) as nprofit, -- todo
    sum(nprofit_c) as nprofit_c
from vw_user_robot_profit_d
group by uiduser_id, ddate;

alter table vw_user_robot_performance_total
  owner to cpz;

