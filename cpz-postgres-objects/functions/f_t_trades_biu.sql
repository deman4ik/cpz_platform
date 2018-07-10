create or replace function f_t_trades_biu() returns trigger
	language plpgsql
as $$
BEGIN
  IF NEW.timestamp is null THEN
    NEW.timestamp := to_timestamp(NEW.date);
  END IF;

   IF (NEW.action = 'short') THEN
      NEW.action := 'sell';
  ELSE
    IF (NEW.action = 'long') THEN
      NEW.action := 'buy';
    ELSE
      IF (NEW.action != 'buy' and NEW.action != 'sell') THEN
        RAISE EXCEPTION '20101: trades.action must be buy|sell';
      END IF;
    END IF;
  END IF;

 RETURN NEW;
END;
$$
;

