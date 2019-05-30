create or replace function f_t_user_robot_biu()
  returns trigger
language plpgsql
as $$
declare
  rROBOT cpz.robot%rowtype;
  nRATE  numeric;
begin
   select * into rROBOT from cpz.robot where id = new.robot_id;

   nRATE := cpz.f_currate_last(1,rROBOT.currency, rROBOT.asset);
   if nRATE is not null then
     new.balance_init = new.volume * nRATE;
   end if;
     
 return new;
end;
$$;

