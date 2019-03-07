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
       u.robot_status AS nSTATUS
FROM user_robot u,
     robot r
WHERE (u.robot_id = r.id);