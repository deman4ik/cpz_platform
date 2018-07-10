create or replace function f_t_tmp_signal_load_bd()
  returns trigger
language plpgsql
as $$
BEGIN
  insert into signals_arc (select * from signals);
  delete from signals;

  RETURN OLD;
END;
$$;

