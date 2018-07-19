create or replace function f_t_tmp_trades_load_bi()
  returns trigger
language plpgsql
as $$
DECLARE
  rTR trade_roundtrips%ROWTYPE;

BEGIN
  if NEW.position is null and NEW.symbol is null then
    return null;
  end if;

  rTR.entry_date := to_date(NEW.entry_date,'DD/MM/YYYY');
  if NEW.exit_date = 'Open' then
    rTR.exit_date := null;
  else
    rTR.exit_date := to_date(NEW.exit_date,'DD/MM/YYYY');
  end if;

  rTR.action := NEW.position;
  if rTR.action not in ('Buy','Sell','Short','Long') then
    RAISE EXCEPTION '20101: tmp_trades_load.position must be: Buy, Sell, Short, Long';
  end if;

  NEW.entry_price := replace(NEW.entry_price, ',', '.');
  NEW.exit_price  := replace(NEW.exit_price,  ',', '.');
  NEW.profit_$    := replace(NEW.profit_$,    ',', '.');


  rTR.entry_price :=  regexp_replace(NEW.entry_price, '[^\d.-]', '', 'g'); -- not digits and not minus
  rTR.profit$     :=  regexp_replace(NEW.profit_$,    '[^\d.-]', '', 'g');
  if NEW.exit_price = 'Open' or NEW.exit_price = '' then
    rTR.exit_price := null;
  else
    rTR.exit_price  :=  regexp_replace(NEW.exit_price,  '[^\d.-]', '', 'g');
  end if;

  BEGIN
    select id
    into strict rTR.robot
    from robots
    where name = NEW.strategy_name;

    EXCEPTION
    WHEN NO_DATA_FOUND
      THEN
        RAISE EXCEPTION '20101: robot by name "%" not found', NEW.strategy_name;
  END;

  rTR.quantity := NEW.quantity;
  rTR.bars_held := NEW.bars_held;
  rTR.historic := 1; -- imported, but not generated from running robot

  -- only for last year: checking if open round exists
  if rTR.exit_date is not null and to_char(now(),'yyyy') = to_char(rTR.entry_date,'yyyy')  then
    BEGIN
      select id
      into strict rTR.id
      from trade_roundtrips
      where
          robot = rTR.robot
      and entry_date = rTR.entry_date
      and entry_price = rTR.entry_price
      and action = rTR.action
      and exit_date is null
      and exit_price is null;

      EXCEPTION
      WHEN NO_DATA_FOUND THEN
          null;
    END;
  end if;

  if rTR.id is not null then
    update trade_roundtrips
      set exit_date = rTR.exit_date,
          exit_price = rTR.exit_price,
          bars_held = rTR.bars_held,
          profit$ = rTR.profit$
    where id = rTR.id;
  else
    insert into trade_roundtrips (
      robot,
      quantity,
      action,
      entry_date,
      entry_price,
      exit_date,
      exit_price,
      bars_held,
      profit$,
      historic
    ) values (
      rTR.robot,
      rTR.quantity,
      rTR.action,
      rTR.entry_date,
      rTR.entry_price,
      rTR.exit_date,
      rTR.exit_price,
      rTR.bars_held,
      rTR.profit$,
      rTR.historic
    );
  --on conflict do nothing;

  RETURN NEW;
END;
$$;

