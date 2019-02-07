create table user_robothist
(
	id               numeric(17)  not null default nextval('cpz_id_seq'::regclass)
    constraint c_user_robothist_pk
    primary key,
	user_robot_id    uuid not null
			constraint c_user_robothist_user_robot_fk
			references user_robot,	
	action_date		   timestamp not null default CURRENT_DATE,
	action			     varchar(10) not null,
	run_mode      	 varchar(10) not null,
	note					   text,
	user_params		   jsonb,
	advisersettings  jsonb,
	tradersettings   jsonb,
	candlebatchersettings jsonb 	
);

alter table user_robothist
  add constraint c_user_robothist_uk
    unique (user_robot_id,action_date);
    
alter table user_robothist
  add constraint c_user_robothist_run_mode_chk
    check (run_mode in ('emulator','realtime'));
    
alter table user_robothist
  add constraint c_user_robothist_staction_chk
    check (action in ('start','change_mode','stop_auto','stop_user','error'));   
        	
create index i_user_robothist_user_robot_fk on user_robothist (user_robot_id);


comment on table user_robot is 'History of starting and stopping robots';


