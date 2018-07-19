create or replace function f_t_tmp_signal_load_bi()
  returns trigger
language plpgsql
as $$
DECLARE
  rSIGNAL signals%ROWTYPE;
BEGIN
  new.alert_time := replace(new.alert_time,'/','.');

  rSIGNAL.date_time := to_date(new.alert_time,'DD.MM.YYYY');
  rSIGNAL.action := new.action;
  rSIGNAL.signal_type := new.order_type;
  rSIGNAL.signal_name := new.signal_name;
  if rSIGNAL.action not in ('Buy','Sell','Short','Cover') then
    RAISE EXCEPTION '20101: tmp_signal_load.action must be: Buy, Sell, Short, Cover (got: %s)', NEW.action;
  end if;

  NEW.price := replace(new.price, ',', '.');
  rSIGNAL.price := regexp_replace(NEW.price, '[^\d.-]', '', 'g'); -- удаляем не цифры

  BEGIN
    select id
    into strict rSIGNAL.robot
    from robots
    where name = new.strategy_name;

    EXCEPTION
    WHEN NO_DATA_FOUND
      THEN
        RAISE EXCEPTION '20101: robot by name "%" not found', new.strategy_name;
  END;

  insert into signals (
    date_time,
    robot,
    action,
    price
  ) values (
    rSIGNAL.date_time,
    rSIGNAL.robot,
    rSIGNAL.action,
    rSIGNAL.price
  );
  --on conflict do nothing;

  RETURN NEW;
END;
$$;

