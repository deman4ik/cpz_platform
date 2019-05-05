drop view v_robots;

create or replace view v_robots as
SELECT u.id,
       u.robot_id,
       u.name,
       (select max(action_date) from user_robothist h where h.user_robot_id = u.id) as last_hist_date,
       (select max(action) OVER (order by action_date desc)
        from user_robothist h where h.user_robot_id = u.id limit 1) as last_hist_action,
       u.volume,
       u.timeframe,
       u.asset,
       u.currency,
       u.exchange,
       u.robot_status,
       u.strat_id,
       u.filename,
       u.last_started,
       (select max(action_date) OVER (order by action_date desc)
        from user_robothist h where h.user_robot_id = u.id and action = 'started' limit 1) as last_hist_started,
       u.dt_from,
       u.dt_to,
       date_part('day',(CURRENT_DATE-u.last_started)) as DAYS_ACTIVE,
       u.user_id,
       u.linked_user_robot_id
FROM
  (select
     uu.*,
     r.name, r.asset, r.currency, r.exchange, r.timeframe,
     s.id as strat_id, s.filename
   from
     user_robot uu,
     robot r,
     strat s
   where
         uu.robot_id = r.id
     and r.strat = s.id
     and r.enabled > 0
  ) u
;