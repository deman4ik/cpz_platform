CREATE OR REPLACE FUNCTION f_t_candles_post_timeframe (
  nFLAG_SMART in integer, -- 1 - skip raising except.
  nFRAME      in integer, -- timeframe in minutes
  nEXCHANGE   in bigint,
  sCURRENCY   in varchar,
  sASSET      in varchar,
  dTIMESTAMP  in timestamp
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  rC5 candles5%rowtype;
  nCNT integer;
BEGIN
  if nFRAME not in (5,30,60) then
    if nFLAG_SMART = 0 then
      RAISE EXCEPTION '20101: f_t_candles_post_timeframe: unknown timeframe (got: %s, need 5|30|60)', nFRAME;
    else
      RETURN 0;
    end if;

  end if;

  if (to_char(dTIMESTAMP,'mi')::int)%nFRAME = 0 then
    rC5.time_start := dTIMESTAMP - make_interval(mins => (nFRAME-1)); -- start from 1 min, for ex. 00:01-01:00, or 00:21-00:25
    rC5.time_end   := dTIMESTAMP;
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
            where t.asset = sASSET
              and t.exchange = nEXCHANGE
              and t.currency = sCURRENCY
              and t.timestamp >= rC5.time_start
              and t.timestamp <= rC5.time_end
            WINDOW w AS (
              PARTITION BY (t.exchange, t.currency, t.asset)
              ORDER BY t.start
              ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
          ) tt
      group by asset, exchange, currency, first_open, last_close;

      -- if we have lags, then mark it
      if nCNT != nFRAME then
        rC5.gap := 1;
      else
        rC5.gap := 0;
      end if;
      rC5.asset := sASSET;
      rC5.exchange := nEXCHANGE;
      rC5.currency := sCURRENCY;

      if nFRAME = 60 then
        insert into CANDLES60
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

      elsif nFRAME = 30 then
        insert into CANDLES30
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

      elsif nFRAME = 5 then
        insert into CANDLES5
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
      else
        null;
      end if;

    EXCEPTION
    WHEN NO_DATA_FOUND
      THEN null;
    END;
  end if;

  RETURN 1;
END;
$$;

