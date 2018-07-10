CREATE OR REPLACE FUNCTION p_trades_insert_j(j json)
  RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  rTRADE    trades%ROWTYPE;
  nEXCHANGE bigint;
BEGIN
  rTRADE.date := j ->> 'date';
  rTRADE.action := j ->> 'action';
  rTRADE.price := j ->> 'price';

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
    into strict rTRADE.strat
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
    where strat = rTRADE.strat
          and exchange = nEXCHANGE
          and currency = j ->> 'currency'
          and asset = j ->> 'asset'
          and candlesize = (j ->> 'candleSize') :: integer;

    EXCEPTION
    WHEN NO_DATA_FOUND
      THEN
        RAISE EXCEPTION '20101: robot not found';
  END;

  insert into trades (
    date,
    action,
    price,
    robot,
    strat
  ) values (
    rTRADE.date,
    rTRADE.action,
    rTRADE.price,
    rTRADE.robot,
    rTRADE.strat
  )
  on conflict do nothing; -- both for uk and pk

  RETURN 1;
END;
$$;