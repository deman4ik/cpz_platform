create or replace function f_t_exchange_biu() returns trigger
	language plpgsql
as $$
BEGIN
  new.code := trim(lower(new.code));

  RETURN NEW;
END;
$$
;

