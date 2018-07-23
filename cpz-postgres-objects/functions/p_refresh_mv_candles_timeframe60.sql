create or replace function p_refresh_mv_candles_timeframe60()
  returns boolean
language plpgsql
as $$
DECLARE
BEGIN
  refresh materialized view CONCURRENTLY mv_candles_timeframe60;
  return true;
END;
$$;


