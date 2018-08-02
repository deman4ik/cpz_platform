CREATE OR REPLACE FUNCTION f_t_candles_aiu()
  RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  i integer;
BEGIN
  -- 1) 5 mins into candles5
  /*i := f_t_candles_post_timeframe(
            nflag_smart := 0,
            nframe      := 5,
            nexchange   := NEW.exchange,
            scurrency   := NEW.currency,
            sasset      := NEW.asset,
            dtimestamp  := NEW.timestamp
        );*/
  -- 2) 30 mins into candles30
    i := f_t_candles_post_timeframe(
            nflag_smart := 1, -- no exception msgs
            nframe      := 30,
            nexchange   := NEW.exchange,
            scurrency   := NEW.currency,
            sasset      := NEW.asset,
            dtimestamp  := NEW.timestamp
        );

   -- 3) 60 mins into candles60
    i := f_t_candles_post_timeframe(
            nflag_smart := 1,
            nframe      := 60,
            nexchange   := NEW.exchange,
            scurrency   := NEW.currency,
            sasset      := NEW.asset,
            dtimestamp  := NEW.timestamp
        );

 RETURN NEW;
END;
$$;

