drop view vw_user_robot;

create view vw_user_robot as
SELECT u.id           AS uidUSER_ROBOT_ID,
       u.user_id      AS uidUSER_ID,
       u.robot_id     AS nROBOT_ID,
       r.name         AS sROBOT_NAME,
       r.asset        AS sASSET,
       r.exchange     AS sEXCHANGE,
       u.volume       AS nVOLUME, -- volume in coins
       round(u.volume*4140,2)  as nVOLUME_C, -- volume in currency
       0              AS nPROFIT, -- performance in coins
       0              as nPROFIT_C, -- performance in currency
       0              as nPROFIT_PCN, -- performance %
       0              as nPROFIT_PCN_C, -- performance in currency %     
       u.balance_init as nBALANCE_INIT, -- "Initial capital" in coins
       u.balance_init as nBALANCE_INIT_C, -- "Initial capital" in currency
       u.balance_current as nBALANCE_CURRENT, -- "Robot balance" in coins
       u.balance_current as nBALANCE_CURRENT_C, -- "Robot balance" in currency
       u.last_started AS dSTARTED,
       u.dt_from      AS dFROM,
       u.dt_to        AS dTO,
       u.robot_status AS nSTATUS,
       (select
          json_agg ( row_to_json(p) )
        from (
          select pf.dDATE, pf.nPROFIT
          from vw_user_robot_performance pf
          where pf.nrobot_id = u.robot_id and pf.uiduser_id = u.user_id and pf.ddate >= (current_date - 7)
          order by dDATE asc
        ) p) as jPERF_ARRAY
FROM user_robot u,
     robot r
WHERE (u.robot_id = r.id);