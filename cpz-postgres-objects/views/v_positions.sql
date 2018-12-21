drop view v_positions;

create view v_positions as
SELECT b.started_at,
       b.ended_at,
       b.note,
       p.backtest_id,
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
       p.action
FROM positions p,
     backtest b
WHERE (p.backtest_id = b.id);

alter table v_positions
  owner to cpz;

