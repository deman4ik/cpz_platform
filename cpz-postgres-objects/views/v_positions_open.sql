drop view v_positions_open;

create or replace view v_positions_open as
SELECT p.id,
       p.user_id,
       p.robot_id,
       rr.code as robot_code,
       uu.id as user_robot_id,
       p.asset,
       p.currency,
       p.exchange,
       p.timeframe,
       p.code,
       p.entry_date,
       p.entry_price,
       p.status,
       p.reason,
       p.bars_held,
       p.quantity,
       (select alert_time from signal where position_id = p.id and action in ('short','long')) as signal_time_open,
       (select price from signal where position_id = p.id and action in ('short','long')) as signal_price_open,
       p.direction,
       p.entry_balance,
       p.profit,
       oo.status as o_status_open,  oo.created_at as o_created_at_open,  oo.order_type as o_type_open,  oo.order_price as o_price_open,  oo.candle_timestamp as o_candle_timestamp_open,
       oo.order_ex_num as o_ex_num_open,
       p.run_mode,
       p.trader_id
FROM 
  (select 
     pp.*, pp.OID,
     (select first_value(id) OVER (order by created_at desc)
       from orders 
       where position_id = pp.id and user_id = pp.user_id and  action in ('short','long')
       limit 1
     ) as order_open_id
     from 
     positions pp
     where pp.exit_date is null and run_mode != 'backtest'
  ) p
left join orders oo on oo.id = p.order_open_id
join user_robot uu on uu.user_id = p.user_id and uu.robot_id = p.robot_id
join robot rr on uu.robot_id = rr.id
;

alter table v_positions_open
  owner to cpz;

