drop view v_positions_w_orders;

create view v_positions_w_orders as
SELECT p.id,
       p.user_id,
       p.robot_id,
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
       (select candle_timestamp from signal where position_id = p.id and action in ('short','long')) as signal_time_open,
       (select candle_timestamp from signal where position_id = p.id and action in ('closeShort','closeLong')) as signal_time_close,
       (select price from signal where position_id = p.id and action in ('short','long')) as signal_price_open,
       (select price from signal where position_id = p.id and action in ('closeShort','closeLong')) as signal_price_close,
       p.direction,
       p.entry_balance,
       p.exit_balance, 
       p.profit,  
       p.trader_id,    
       p.backtest_id,
       b.started_at,
       b.ended_at,
       b.note,
       oo.status as o_status_open,  oo.created_at as o_created_at_open,  oo.order_type as o_type_open,  oo.order_price as o_price_open,  oo.candle_timestamp as o_candle_timestamp_open,
       oc.status as o_status_close, oc.created_at as o_created_at_close, oc.order_type as o_type_close, oc.order_price as o_price_close, oc.candle_timestamp as o_candle_timestamp_close
FROM positions p
left join backtest b on (p.backtest_id = b.id)
left join orders oo on (p.id = oo.position_id and oo.action in ('short','long'))
left join orders oc on (p.id = oc.position_id and oc.action in ('closeShort','closeLong'));

alter table v_positions_w_orders
  owner to cpz;

