drop view vw_user_robot_link;

create view vw_user_robot_link as

SELECT uu.id           AS uidUSER_ROBOT_ID,
       uu.user_id      AS uidUSER_ID,
       uu.robot_id     AS nROBOT_ID,
       uu.name         AS sROBOT_NAME,
       uu.asset        AS sASSET,
       uu.currency     AS sCURRENCY,
       uu.exchange     AS sEXCHANGE,
       uu.timeframe    AS nTIMEFRAME,
       ul.id           AS uidUSER_ROBOT_ID_LINKED,
       ul.user_id      AS uidUSER_ID_LINKED,
       ul.robot_id     AS nROBOT_ID_LINKED,
       ul.name         AS sROBOT_NAME_LINKED,
       ul.asset        AS sASSET_LINKED,
       ul.currency     AS sCURRENCY_LINKED,
       ul.exchange     AS sEXCHANGE_LINKED,
       ul.timeframe    AS nTIMEFRAME_LINKED       
FROM
  user_robot uu 
left join user_robot ul on uu.linked_user_robot_id = ul.id
;
      