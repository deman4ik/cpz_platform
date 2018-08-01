CREATE OR REPLACE FUNCTION f_t_candles_aiu()
  RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  rC5 candles5%rowtype;
  nCNT integer;
  nFRAME integer;
BEGIN
  -- 1) 5 mins into candles5
  nFRAME := 5;
  if (to_char(NEW.timestamp,'mi')::int)%nFRAME = 0 then
    rC5.time_start := NEW.timestamp - make_interval(mins => (nFRAME-1)); -- start from 1 min, for ex. 00:24-00:30
    rC5.time_end   := NEW.timestamp;
    BEGIN
      select
          first_open,
          last_close,
          min(start)   AS start,
          max(start)   AS "end",
          max(high)    AS high,
          min(low)     AS low,
          sum(volume)  AS volume,
          sum(trades)  AS trades,
          sum(vwp)     AS vwp,
          count(*)     AS cnt
      into rC5.open, rC5.close, rC5.start, rC5."end", rC5.high, rC5.low, rC5.volume, rC5.trades, rC5.vwp, nCNT
      from (
           select t.*, first_value(open) over W AS first_open, last_value(close) over W AS last_close
            from candles t
            where t.asset = NEW.asset
              and t.exchange = NEW.exchange
              and t.currency = NEW.currency
              and t.timestamp >= rC5.time_start
              and t.timestamp <= rC5.time_end
            WINDOW w AS (
              PARTITION BY (t.exchange, t.currency, t.asset)
              ORDER BY t.start
              ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
          ) tt
      group by asset, exchange, currency, first_open, last_close;

      -- if we have lags, then skip mark it
      if nCNT != nFRAME then
        rC5.gap := 1;
      else
        rC5.gap := 0;
      end if;
      rC5.asset := NEW.asset;
      rC5.exchange := NEW.exchange;
      rC5.currency := NEW.currency;

      insert into candles5
          (time_start, time_end, start, "end", open, high, low, close, volume, trades, vwp, currency, asset, exchange, gap)
      values (
        rC5.time_start,
        rC5.time_end,
        rC5.start,
        rC5."end",
        rC5.open,
        rC5.high,
        rC5.low,
        rC5.close,
        rC5.volume,
        rC5.trades,
        rC5.vwp,
        rC5.currency,
        rC5.asset,
        rC5.exchange,
        rC5.gap
      ) on conflict do nothing;

    EXCEPTION
    WHEN NO_DATA_FOUND
      THEN null;
    END;
  end if;

  -- 1) 60 mins into candles60
  nFRAME := 60;
  if (to_char(NEW.timestamp,'mi')::int)%nFRAME = 0 then
    rC5.time_start := NEW.timestamp - make_interval(mins => (nFRAME-1)); -- start from 1 min, for ex. 00:01-01:00
    rC5.time_end   := NEW.timestamp;
    BEGIN
      select
          first_open,
          last_close,
          min(start)   AS start,
          max(start)   AS "end",
          max(high)    AS high,
          min(low)     AS low,
          sum(volume)  AS volume,
          sum(trades)  AS trades,
          sum(vwp)     AS vwp,
          count(*)     AS cnt
      into rC5.open, rC5.close, rC5.start, rC5."end", rC5.high, rC5.low, rC5.volume, rC5.trades, rC5.vwp, nCNT
      from (
           select t.*, first_value(open) over W AS first_open, last_value(close) over W AS last_close
            from candles t
            where t.asset = NEW.asset
              and t.exchange = NEW.exchange
              and t.currency = NEW.currency
              and t.timestamp >= rC5.time_start
              and t.timestamp <= rC5.time_end
            WINDOW w AS (
              PARTITION BY (t.exchange, t.currency, t.asset)
              ORDER BY t.start
              ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
          ) tt
      group by asset, exchange, currency, first_open, last_close;

      -- if we have lags, then skip mark it
      if nCNT != nFRAME then
        rC5.gap := 1;
      else
        rC5.gap := 0;
      end if;
      rC5.asset := NEW.asset;
      rC5.exchange := NEW.exchange;
      rC5.currency := NEW.currency;

      insert into candles60
          (time_start, time_end, start, "end", open, high, low, close, volume, trades, vwp, currency, asset, exchange, gap)
      values (
        rC5.time_start,
        rC5.time_end,
        rC5.start,
        rC5."end",
        rC5.open,
        rC5.high,
        rC5.low,
        rC5.close,
        rC5.volume,
        rC5.trades,
        rC5.vwp,
        rC5.currency,
        rC5.asset,
        rC5.exchange,
        rC5.gap
      ) on conflict do nothing;

    EXCEPTION
    WHEN NO_DATA_FOUND
      THEN null;
    END;
  end if;
 
 RETURN NEW;
END;
$$;

