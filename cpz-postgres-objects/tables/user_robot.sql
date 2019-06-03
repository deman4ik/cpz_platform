create table user_robot
(
	id              uuid
		  constraint c_user_robot_pk
			primary key,
	robot_id        numeric(17) not null
			constraint c_user_robot_robot_fk
			references robot,
	user_id         uuid not null
			constraint c_user_robot_userlist_fk
			references userlist,	
	robot_status    integer default 0 not null,
	balance_init    numeric default 0 not null,
	balance_current numeric default 0 not null,
	last_started    timestamp default CURRENT_DATE not null,
	dt_from					timestamp not null,
	dt_to						timestamp not null,
	run_mode      	varchar(10) not null, -- goes to tradersettings
	volume		      numeric,              -- goes to tradersettings
	user_params			jsonb,	 -- goes to tradersettings, additional params for a particular exchange or user_robot
	linked_user_robot_id     uuid
			constraint c_user_robot_linked_user_robot_fk
			references user_robot on delete set null, -- for subscribed user robots
	user_exchacc   uuid		
);

alter table user_robot
  add constraint c_user_robot_uk
    unique (robot_id,user_id);
    
alter table user_robot
  add constraint c_user_robot_run_mode_chk
    check (run_mode in ('emulator','realtime'));
        	
create index i_user_robot_userlist_fk on user_robot (user_id);

alter table user_robot add constraint c_user_robot_status_chk check (robot_status in (-1, 0, 1, 5, 10, 15, 20));

comment on column user_robot.robot_status is '
-1 - deleted
0 - default
1 - followed (added to dashboard)
5 - starting
10 - started (running)
15 - stopping
20 - stopped';

comment on column user_robot.dt_to is 'Date and time robot will be stopped according to user subsribtion';

comment on table user_robot is 'User subscription for a robot';


