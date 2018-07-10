CREATE OR REPLACE FUNCTION p_trade_roundtrips_insert_j(j json)
  RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  rTRADE    trade_roundtrips%ROWTYPE;
  nEXCHANGE bigint;
  nSTRAT    bigint;
BEGIN
/*  j = object like  {
        action: buy | sell,
        entryAt: Moment<'2017-03-25 19:41:00'>,
        entryPrice: 10.21315498,
        entryBalance: 98.19707799420277,
        exitAt: Moment<'2017-03-25 19:41:00'>
        exitPrice: 10.22011632,
        exitBalance: 97.9692176,
        duration: 3600000,
        method: 'DMA',
        candleSize: 5,
        currency: 'USD',
        asset: 'BTC',
        exchange: 'bitfinex'
    }*/

  IF (j->>'exchange' is null) THEN
    RAISE EXCEPTION '20101: json key "exchange" must be specified';
  END IF;
  IF (j->>'currency' is null) THEN
    RAISE EXCEPTION '20101: json key "currency" must be specified';
  END IF;
  IF (j->>'asset' is null) THEN
    RAISE EXCEPTION '20101: json key "asset" must be specified';
  END IF;
  IF (j->>'method' is null) THEN
    RAISE EXCEPTION '20101: json key "method" must be specified';
  END IF;
  IF (j->>'action' not in ('buy','sell','short','long')) THEN
    RAISE EXCEPTION '20101: json key "action" must be = buy|sell';
  END IF;

  BEGIN
    select id
    into strict nEXCHANGE
    from exchanges
    where code = lower(j ->> 'exchange');

    EXCEPTION
    WHEN NO_DATA_FOUND
      THEN
        RAISE EXCEPTION '20101: exchange by code "%" not found', j ->> 'exchange';
  END;

  BEGIN
    select id
    into strict nSTRAT
    from strat
    where code = j ->> 'method';

    EXCEPTION
    WHEN NO_DATA_FOUND
      THEN
        RAISE EXCEPTION '20101: strat by code "%" not found', j ->> 'method';
  END;

  BEGIN
    select id
    into strict rTRADE.robot
    from robots
    where strat      = nSTRAT
      and exchange   = nEXCHANGE
      and currency   = j ->> 'currency'
      and asset      = j ->> 'asset'
      and candlesize = (j ->> 'candleSize')::integer;

    EXCEPTION
    WHEN NO_DATA_FOUND
      THEN
        RAISE EXCEPTION '20101: robot by exchange+currency+asset+candleSize not found';
  END;

  IF ( (j ->> 'candleSize')::integer  < 24*60 and j ->> 'entryAt' =  j ->> 'exitAt') THEN
    RAISE EXCEPTION '20101: candlesize < 1 day, but entryAt = exitAt';
  END IF;

  -- rTRADE.robot
  rTRADE.quantity      := 1; -- !!! replace later for robot.quantity
  rTRADE.action        := j ->> 'action'; -- buy (long) / sell (short)
  rTRADE.entry_date    := j ->> 'entryAt';
  rTRADE.entry_price   := j ->> 'entryPrice';
  rTRADE.entry_balance := j ->> 'entryBalance';
  rTRADE.exit_date     := j ->> 'exitAt';
  rTRADE.exit_price    := j ->> 'exitPrice';
  rTRADE.exit_balance  := j ->> 'exitBalance';
  rTRADE.bars_held     := (j ->> 'duration')::integer / (j ->> 'candleSize')::integer;

  insert into trade_roundtrips (
    robot,
    quantity,
    action,
    entry_date,
    entry_price,
    entry_balance,
    exit_date,
    exit_price,
    exit_balance,
    bars_held
  ) values (
    rTRADE.robot,
    rTRADE.quantity,
    rTRADE.action,
    rTRADE.entry_date,
    rTRADE.entry_price,
    rTRADE.entry_balance,
    rTRADE.exit_date,
    rTRADE.exit_price,
    rTRADE.exit_balance,
    rTRADE.bars_held
  )
  on conflict do nothing; -- both for uk and pk

  RETURN 1;
END;
$$;

