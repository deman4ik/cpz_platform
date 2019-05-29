create or replace function f_t_user_robothist_biu()
  returns trigger
language plpgsql
as $$
declare
  nSTATUS int;
  dDATE timestamp;
begin

   if new.action = 'started' then
     dDATE := new.action_date;
     nSTATUS := 10;
   elsif new.action = 'starting' then
     dDATE := null;
     nSTATUS := 5;
   elsif new.action = 'stopping' then
     dDATE := null;
     nSTATUS := 15;
   elsif new.action = 'stopped_user' or new.action = 'error' then
     dDATE := null;
     nSTATUS := 20;
   elsif new.action = 'warn' then
    nSTATUS := null;  
   end if;
    
  if nSTATUS is not null then
   update cpz.user_robot set
     robot_status = nSTATUS,
     last_started = (case when dDATE is not null then dDATE else last_started end),
     run_mode = new.run_mode -- could change on update
   where id = new.user_robot_id;
  end if;
 
 return new;
end;
$$;

