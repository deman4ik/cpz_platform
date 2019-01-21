drop view v_positions;

create view v_positions as
SELECT p.id,
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
       p.entry_balance,
       p.exit_balance,
       p.direction,
       (select candle_timestamp from signal where position_id = p.id and action in ('short','long')) as signal_time_open,
       (select candle_timestamp from signal where position_id = p.id and action in ('closeShort','closeLong')) as signal_time_close,
       (select price from signal where position_id = p.id and action in ('short','long')) as signal_price_open,
       (select price from signal where position_id = p.id and action in ('closeShort','closeLong')) as signal_price_close,
       p.backtest_id,
       b.started_at,
       b.ended_at,
       b.note
FROM positions p
left join backtest b on (p.backtest_id = b.id);

alter table v_positions
  owner to cpz;

