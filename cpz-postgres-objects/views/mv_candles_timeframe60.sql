CREATE MATERIALIZED VIEW mv_candles_timeframe60 AS
  SELECT
    t.end AS date,
    t.open,
    t.high,
    t.low,
    t.close,
    t.exchange,
    e.code AS exchange_code,
    t.currency,
    t.asset
   FROM v_candles_timeframe60 t,
    exchanges e
  WHERE (t.exchange = e.id);

-- to use CONCURRENTLY in refreshing MV
create unique index on mv_candles_timeframe60 (exchange,asset,date);

