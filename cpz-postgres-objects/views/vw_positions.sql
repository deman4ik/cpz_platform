drop view vw_positions;

create view vw_positions as
SELECT p.id,
       p.user_id,
       p.robot_id,
       ur.id as user_robot_id,
       p.asset,
       p.currency,
       p.exchange,
       p.timeframe,
       p.code,
       p.entry_date,
       p.entry_price,
       p.exit_date,
       p.exit_price,
       p.status,
       p.bars_held,
       p.direction,
       p.entry_balance,
       p.exit_balance, 
       p.profit,
       p.code as note,
       ur.robot_status
FROM positions p, user_robot ur
where p.run_mode != 'backtest'
  and p.robot_id = ur.robot_id
  and p.user_id  = ur.user_id;

alter table vw_positions
  owner to cpz;

