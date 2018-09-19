CREATE OR REPLACE FUNCTION "cpz-platform".p_candles_insert(
	ntime integer,
	nopen numeric,
	nhigh numeric,
	nlow numeric,
	nclose numeric,
	nvolume numeric,
	ntrades integer,
	nvwp numeric,
	scurency character varying,
	sasset character varying,
	sexchange character varying)
    RETURNS character varying
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
AS $BODY$

DECLARE
  nFRAME int;
  rCANDLE candles%ROWTYPE;
  rCANDLE_FR candles5%ROWTYPE; -- !! do not delete - left for dependencies
  j varchar;
  j_tmp json;
BEGIN
  /* insert 1min candle
     check timeframe
     select and returns json of frames candles

     returns:

    {"timeframe1": {just posted values with added candle.id}
     "timeframe30":{"id":1,"time_start":"2018-07-20T11:31:00","time_end":"2018-07-20T12:00:00","start":1532087940,"end":1532088000,"open":7489.99,"high":7507,"low":7489.99,"close":7504.77,"volume":14.97665476,"trades":123,"vwp":14984.2782078305,"currency":"USD","asset":"BTC","exchange":5,"gap":1},
     "timeframe60":{"id":1141,"time_start":"2018-07-20T11:01:00","time_end":"2018-07-20T12:00:00","start":1532087940,"end":1532088000,"open":7489.99,"high":7507,"low":7489.99,"close":7504.77,"volume":14.97665476,"trades":123,"vwp":14984.2782078305,"currency":"USD","asset":"BTC","exchange":5,"gap":1}
    }
    OR
    {"error":{"numb" : 20101, "code" : "timeframe", "type" : 5, "start" : 1514764800, "end" : 1514765100, "descr" : "timeframe 5 not found as it should be after trigger"}}

    !!! the framed candle json object is a copy of CANDLES5 table row, will change automatically if table structure changes
  */

  rCANDLE.start     := nTIME;
  rCANDLE.open      := nOPEN;
  rCANDLE.high      := nHIGH;
  rCANDLE.low       := nLOW;
  rCANDLE.close     := nCLOSE;
  rCANDLE.volume    := nVOLUME;
  rCANDLE.trades    := nTRADES;
  rCANDLE.vwp       := nVWP;
  rCANDLE.currency  := sCURENCY;
  rCANDLE.asset     := sASSET;
  rCANDLE.timestamp := to_timestamp(nTIME);
  IF (sEXCHANGE is null) THEN
    RAISE EXCEPTION '20101: json key "exchange" must be specified';
  END IF;

  BEGIN
    select id into strict rCANDLE.exchange from exchanges where code = lower(sEXCHANGE);

  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE EXCEPTION '20101: exchange by code "%" not found', sEXCHANGE;
  END;

  rCANDLE.id := nextval('candles_id_seq');

  insert into candles (
        id,
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
        exchange,
        timestamp
      ) values (
        rCANDLE.id,
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
        rCANDLE.exchange,
        rCANDLE.timestamp
      )
    on conflict do nothing; -- both for uk and pk
   
    -- return posted 1min candle back with id
    j_tmp := json_build_object(
        'id',        rCANDLE.id,
        'time',      rCANDLE.start,
        'open',      rCANDLE.open,
        'high',      rCANDLE.high,
        'low',       rCANDLE.low,
        'close',     rCANDLE.close,
        'volume',    rCANDLE.volume,
        'trades',    rCANDLE.trades,
        'vwp',       rCANDLE.vwp,
        'currency',  rCANDLE.currency,
        'asset',     rCANDLE.asset,
        'exchange',  rCANDLE.exchange,
        'timestamp', rCANDLE.timestamp
      );

    j:='{"timeframe1":'||j_tmp;

    -- check and return framed candles inserted by triggers
    -- algo as in F_T_CANDLES_POST_TIMEFRAME
    nFRAME := 5;
    if (to_char(rCANDLE.timestamp,'mi')::int)%nFRAME = 0 then
      BEGIN
        select row_to_json(t.*) into j_tmp from candles5 t
        where time_end = rCANDLE.timestamp
          and exchange = rCANDLE.exchange
          and currency = rCANDLE.currency
          and asset    = rCANDLE.asset;

        if j_tmp is null then
          --RAISE EXCEPTION '20101: timeframe % not found as it should be after trigger (%, %)', nFRAME, sEXCHANGE, rCANDLE.timestamp;
          j_tmp := json_build_object(
              'numb', 20101,
              'code', 'timeframe',
              'type', nFRAME,
              'start', rCANDLE.start-(nFRAME*60),
              'end',   rCANDLE.start,
              'descr', 'timeframe ' || nFRAME || ' not found as it should be after trigger'
          );
          j:='{"error":'||j_tmp||'}';
          RETURN j;
        end if;

        if (j_tmp->>'gap')::int != 0 then
          j_tmp := json_build_object(
              'numb', 20102,
              'code', 'timeframe',
              'type', nFRAME,
              'start', rCANDLE.start-(nFRAME*60),
              'end',   rCANDLE.start,
              'descr', 'timeframe ' || nFRAME || ' has gaps on the interval'
          );
          j:='{"error":'||j_tmp||'}';
          RETURN j;
        else
          j:=j||', "timeframe5":'||j_tmp;
        end if;
      /* row_to_json does not generate exception
      EXCEPTION
        WHEN NO_DATA_FOUND THEN*/
      END;

    end if;

    nFRAME := 30;
    if (to_char(rCANDLE.timestamp,'mi')::int)%nFRAME = 0 then
      BEGIN
        select row_to_json(t.*) into j_tmp from candles30 t
        where time_end = rCANDLE.timestamp
          and exchange = rCANDLE.exchange
          and currency = rCANDLE.currency
          and asset    = rCANDLE.asset;

        if j_tmp is null then
          --RAISE EXCEPTION '20101: timeframe % not found as it should be after trigger (%, %)', nFRAME, sEXCHANGE, rCANDLE.timestamp;
          j_tmp := json_build_object(
              'numb', 20101,
              'code', 'timeframe',
              'type', nFRAME,
              'start', rCANDLE.start-(nFRAME*60),
              'end',   rCANDLE.start,
              'descr', 'timeframe ' || nFRAME || ' not found as it should be after trigger'
          );
          j:='{"error":'||j_tmp||'}';
          RETURN j;
        end if;

        if (j_tmp->>'gap')::int != 0 then
          j_tmp := json_build_object(
              'numb', 20102,
              'code', 'timeframe',
              'type', nFRAME,
              'start', rCANDLE.start-(nFRAME*60),
              'end',   rCANDLE.start,
              'descr', 'timeframe ' || nFRAME || ' has gaps on the interval'
          );
          j:='{"error":'||j_tmp||'}';
          RETURN j;
        else
            j:=j||', "timeframe30":'||j_tmp;
        end if;
      END;

    end if;

    nFRAME := 60;
    if (to_char(rCANDLE.timestamp,'mi')::int)%nFRAME = 0 then
      BEGIN
        select row_to_json(t.*) into j_tmp from candles60 t
        where time_end = rCANDLE.timestamp
          and exchange = rCANDLE.exchange
          and currency = rCANDLE.currency
          and asset    = rCANDLE.asset;

        if j_tmp is null then
          --RAISE EXCEPTION '20101: timeframe % not found as it should be after trigger (%, %)', nFRAME, sEXCHANGE, rCANDLE.timestamp;
          j_tmp := json_build_object(
              'numb', 20101,
              'code', 'timeframe',
              'type', nFRAME,
              'start', rCANDLE.start-(nFRAME*60),
              'end',   rCANDLE.start,
              'descr', 'timeframe ' || nFRAME || ' not found as it should be after trigger'
          );
          j:='{"error":'||j_tmp||'}';
          RETURN j;
        end if;

        if (j_tmp->>'gap')::int != 0 then
          j_tmp := json_build_object(
              'numb', 20102,
              'code', 'timeframe',
              'type', nFRAME,
              'start', rCANDLE.start-(nFRAME*60),
              'end',   rCANDLE.start,
              'descr', 'timeframe ' || nFRAME || ' has gaps on the interval'
          );
          j:='{"error":'||j_tmp||'}';
          RETURN j;
        else
          j:=j||', "timeframe60":'||j_tmp;
        end if;
      END;
    end if;

    if j is not null then
      j:=j||'}';
    end if;

  RETURN j;
END;

$BODY$;
