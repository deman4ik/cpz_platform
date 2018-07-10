create or replace view v_robot_equity as
  SELECT t.c_balance AS price,
    t.robot
   FROM v_robot_roundtrips_c t
  ORDER BY t.robot, t.entry_date;

