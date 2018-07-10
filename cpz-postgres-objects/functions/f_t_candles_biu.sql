CREATE OR REPLACE FUNCTION f_t_candles_biu()
  RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.timestamp is null THEN
    NEW.timestamp := to_timestamp(NEW.start);
  END IF;
 
 RETURN NEW;
END;
$$;

