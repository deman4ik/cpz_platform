create or replace function f_t_positions_aiu()
  returns trigger
language plpgsql
as $$
declare
  r int;
begin
  if (new.status in ('closed','closedAuto')) then
    -- for lower timeframes must run manually
    if new.timeframe > 5 then
      r := cpz.p_robot_statistics_calc(new.robot_id,new.user_id,1);
    end if;
  end if;  

 return new;
end;
$$;

