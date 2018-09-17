CREATE OR REPLACE FUNCTION p_candles_insert_ja
  (exchange varchar, currency varchar, asset varchar, timeframe int, candles json)
  RETURNS "varchar"
LANGUAGE plpgsql
AS $$
DECLARE
	rCANDLE candles%ROWTYPE;
	rec     RECORD;
	ja      JSON;
BEGIN
	/* for GraphQL invokation

	   GraphQL Query Variables Example:
		{
				"exchange": "bitfinex2", "currency":"USD", "asset":"BTC",
				"candles": [{"time":1534183200,"close":6236.6,"high":6255.2,"low":6190.1,"open":6230,"volume":883.65}]

		returns
		{"status":"ok"}
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
							from json_array_elements(candles)
  ) loop
		ja := rec.value :: json;
		-- if 'time' comes in milliseconds convert to sec
	  if length((ja ->> 0) :: varchar) > 10 then
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

		if timeframe = 1 then
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
		end if;

		if timeframe = 60 then
			insert into candles60 (
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
		end if;
	end loop;


	RETURN '{"status":"ok"}';
END;
$$;