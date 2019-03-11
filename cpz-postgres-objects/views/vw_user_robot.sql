drop view vw_user_robot;

create view vw_user_robot as
SELECT u.id           AS uidUSER_ROBOT_ID,
       u.user_id      AS uidUSER_ID,
       u.robot_id     AS nROBOT_ID,
       r.name         AS sROBOT_NAME,
       r.asset        AS sASSET,
       r.exchange     AS sEXCHANGE,
       u.volume       AS nVOLUME,
       0              AS nPROFIT,
       u.last_started AS dSTARTED,
       u.dt_from      AS dFROM,
       u.dt_to        AS dTO,
       u.robot_status AS nSTATUS,
       (select
          json_agg ( row_to_json(p) )
        from (
          select dDATE, nPROFIT from vw_user_robot_performance pf where pf.nrobot_id = u.robot_id and pf.uiduser_id = u.user_id
        ) p) as jPERF_ARRAY
FROM user_robot u,
     robot r
WHERE (u.robot_id = r.id);