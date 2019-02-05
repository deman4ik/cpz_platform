create or replace function f_t_positions_bd()
  returns trigger
language plpgsql
as $$
begin

  if (old.backtest_id is null) then
    delete from orders where position_id = old.id;
  end if;


 return OLD;
end;
$$;

