CREATE OR REPLACE FUNCTION f_t_trade_roundtrips_biu()
  RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (lower(NEW.action) = 'short' or lower(NEW.action) = 'sell') THEN
      NEW.action := 'sell';
  ELSE
    IF (lower(NEW.action) = 'long' or lower(NEW.action) = 'buy') THEN
      NEW.action := 'buy';
    ELSE
      IF (NEW.action != 'buy' and NEW.action != 'sell') THEN
        RAISE EXCEPTION '20101: trade_roundtrips.action must be buy|sell';
      END IF;
    END IF;
  END IF;

  IF (NEW.entry_balance IS NULL) THEN
    NEW.entry_balance := NEW.entry_price*NEW.quantity;
  END IF;

  IF (NEW.exit_balance IS NULL) THEN
    NEW.exit_balance := NEW.exit_price*NEW.quantity;
  END IF;

  IF (NEW."profit$" IS NULL) THEN
    IF (NEW.action = 'sell') THEN
      NEW."profit$" := NEW.entry_balance-NEW.exit_balance;
    ELSE
      NEW."profit$" := NEW.exit_balance-NEW.entry_balance;
    END IF;
  END IF;

  -- for data import
  IF (NEW.id is null) THEN
    NEW.id := nextval('trade_roundtrips_id_seq'::regclass);
  END IF;

 RETURN NEW;
END;
$$;

