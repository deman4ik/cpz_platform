CREATE or replace FUNCTION p_candles_insert_j(j json)
  RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  rCANDLE candles%ROWTYPE;
BEGIN
  rCANDLE.start     := j->>'start';
  rCANDLE.open      := j->>'open';
  rCANDLE.high      := j->>'high';
  rCANDLE.low       := j->>'low';
  rCANDLE.close     := j->>'close';
  rCANDLE.volume    := j->>'volume';
  rCANDLE.trades    := j->>'trades';
  rCANDLE.vwp       := j->>'vwp';
  rCANDLE.currency  := j->>'currency';
  rCANDLE.asset     := j->>'asset';
  IF (j->>'exchange' is null) THEN
    RAISE EXCEPTION '20101: json key "exchange" must be specified';
  END IF;

  BEGIN
    select id into strict rCANDLE.exchange from exchanges where code = lower(j->>'exchange');

  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE EXCEPTION '20101: exchange by code "%" not found', j->>'exchange';
  END;

  insert into candles (
        start,
        open,
        high,
        low,
        close,
        volume,
        trades,
        vwp,
        currency,
        asset,
        exchange
      ) values (
        rCANDLE.start,
        rCANDLE.open,
        rCANDLE.high,
        rCANDLE.low,
        rCANDLE.close,
        rCANDLE.volume,
        rCANDLE.trades,
        rCANDLE.vwp,
        rCANDLE.currency,
        rCANDLE.asset,
        rCANDLE.exchange
      )
    on conflict do nothing; -- both for uk and pk

  RETURN 1;
END;
$$;

