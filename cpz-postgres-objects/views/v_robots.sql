drop view v_robots;

create or replace view v_robots as
SELECT
       u.rid as robot_id,
       u.email as user_email,
       u.first_name as user_name,
       u.id as robot_id,
       u.code as robot_code,
       u.name as robot_name,
       u.timeframe,
       u.run_mode,
       u.robot_status,       
       (select max(action_date) from user_robothist h where h.user_robot_id = u.id) as last_hist_date,
       (select max(action) OVER (order by action_date desc)
        from user_robothist h where h.user_robot_id = u.id limit 1) as last_hist_action,
       (select max(action_date) OVER (order by action_date desc)
        from user_robothist h where h.user_robot_id = u.id and action = 'started' limit 1) as last_hist_started,
       u.volume,
       u.asset,
       u.currency,
       u.exchange,
       u.enabled,
       u.strat_id,
       u.filename,
       u.last_started,
       u.dt_from,
       u.dt_to,
       date_part('day',(CURRENT_DATE-u.last_started)) as DAYS_ACTIVE,
       u.user_id,
       u.linked_user_robot_id,
       u.advisersettings,
       u.tradersettings
FROM
  (select
     uu.*,
     r.id as rid, r.code, r.name, r.asset, r.currency, r.exchange, r.timeframe, r.enabled, r.advisersettings,  r.tradersettings,
     s.id as strat_id, s.filename, ul.email, ul.first_name
   from
     robot r
        join strat s on r.strat = s.id
   left join user_robot uu on uu.robot_id = r.id
   left join userlist ul on uu.user_id = ul.id
   where r.enabled > 0
  ) u
;