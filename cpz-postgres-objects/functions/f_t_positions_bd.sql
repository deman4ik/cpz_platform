create or replace function f_t_positions_bd()
  returns trigger
language plpgsql
as $$
begin

  if (old.backtest_id is null) then
    -- there are no physical constrains because records from backend are posted async.
    delete from cpz.orders where position_id = old.id;
    delete from cpz.signal where position_id = old.id;
  end if;


 return OLD;
end;
$$;

