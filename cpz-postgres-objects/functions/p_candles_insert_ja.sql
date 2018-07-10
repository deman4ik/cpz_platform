--drop function p_candles_insert_ja;
create function p_candles_insert_ja(exchange varchar,
                                    currency varchar,
                                    asset    varchar,
                                    candles  json)
  returns candles
language plpgsql
as $$
DECLARE
  rCANDLE candles%ROWTYPE;
  rec     RECORD;
  ja      JSON;
BEGIN
  /* GraphQL Query Variables Example:
    {
        "exchange": "bitfinex2", "currency":"USD", "asset":"BTC",
        "candles": "[[1504543000000,4235.1,4240.1,4230.1,4230.1,37.1],[1504543000000,4235.4,4240.6,4230.0,4230.7,37.7]]"
}
*/
  rCANDLE.currency := currency;
  rCANDLE.asset := asset;
  IF (exchange is null)
  THEN
    RAISE EXCEPTION '20101: json key "exchange" must be specified';
  END IF;

  BEGIN
    select id
    into strict rCANDLE.exchange
    from exchanges
    where code = lower(exchange);

    EXCEPTION
    WHEN NO_DATA_FOUND
      THEN
        RAISE EXCEPTION '20101: exchange by code "%" not found', exchange;
  END;

  for rec in (select *
              from json_array_elements(candles)) loop
    ja := rec.value :: json;
    -- if 'start' comes in milliseconds convert to sec
    if length((ja ->> 0) :: varchar) > 10
    then
      rCANDLE.start := (ja ->> 0) :: bigint / 1000;
    else
      rCANDLE.start := (ja ->> 0) :: integer;
    end if;
    rCANDLE.open := ja ->> 1;
    rCANDLE.high := ja ->> 2;
    rCANDLE.low := ja ->> 3;
    rCANDLE.close := ja ->> 4;
    rCANDLE.volume := ja ->> 5;

    rCANDLE.trades := null;
    rCANDLE.vwp := null;
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
  end loop;


  RETURN 1;
END;
$$;

