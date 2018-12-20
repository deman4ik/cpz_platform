create or replace function f_t_positions_biu()
  returns trigger
language plpgsql
as $$
begin

  if (new.entry_balance is null) then
    new.entry_balance := new.entry_price*new.quantity;
  end if;

  if (new.exit_balance is null) then
    new.exit_balance := new.exit_price*new.quantity;
  end if;

  if (new.profit is null) then
    if (new.action in ('closeLong','short')) then
      new.profit := new.entry_balance-new.exit_balance;
    else
      new.profit := new.exit_balance-new.entry_balance;
    end if;
  end if;
  
  if (new.bars_held is null) then
      if (new.action in ('closeLong','closeShort')) then
        new.bars_held := EXTRACT(EPOCH FROM (new.exit_date - new.entry_date))::int/60/new.timeframe; -- all timeframes are in minutes
      end if;
  end if;

 return new;
end;
$$;

