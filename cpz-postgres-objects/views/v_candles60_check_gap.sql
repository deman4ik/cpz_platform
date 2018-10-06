create or replace view V_CANDLES60_CHECK_GAP as
  SELECT
	  t.id,
    t.time_start,
    t.time_end,
	  t.asset,
	  t.currency,
    t.exchange as exchange_id,
    e.code as exchange_code,
    t.open,
    t.high,
    t.low,
    t.close,
    t.start,
    t.end
  FROM candles60 t, exchanges e
  where t.exchange = e.id	
    and gap != 0