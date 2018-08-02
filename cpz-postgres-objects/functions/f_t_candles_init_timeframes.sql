CREATE OR REPLACE FUNCTION f_t_candles_init_timeframes(
  dFROM in date,
  dTO in date,
  nEXCHANGE in bigint,
  sCURRENCY in varchar default null,
  sASSET    in varchar default null
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  n integer;
  rec record;
BEGIN
  --delete from candles5 where time_end >= dFROM and time_end <= dTO;
  delete from candles60 where time_end >= dFROM and time_end <= dTO;

  -- invoking update to run a trigger f_t_candles_aiu with timeframes init
  /*update candles set start = start
  where
      timestamp >= dFROM and timestamp <= dTO
  and exchange = nEXCHANGE
  and (sCURRENCY is null or currency = sCURRENCY)
  and (sASSET is null or asset = sASSET);*/

  for rec in (
    select * from candles
    where
          timestamp >= dFROM and timestamp <= dTO
      and exchange = nEXCHANGE
      and (sCURRENCY is null or currency = sCURRENCY)
      and (sASSET is null or asset = sASSET)
    order by start asc
  ) loop
    n := f_t_candles_post_timeframe(
            nflag_smart := 0,
            nframe      := 60,
            nexchange   := rec.exchange,
            scurrency   := rec.currency,
            sasset      := rec.asset,
            dtimestamp  := rec.timestamp
        );
    n := f_t_candles_post_timeframe(
            nflag_smart := 0,
            nframe      := 30,
            nexchange   := rec.exchange,
            scurrency   := rec.currency,
            sasset      := rec.asset,
            dtimestamp  := rec.timestamp
        );

  end loop;

  RETURN 1;
END;
$$;

