create table user_robot
(
	id              uuid
		  constraint c_user_robot_pk
			primary key,
	robot_id        numeric(17) not null
			constraint c_user_robot_robot_fk
			references robot,
	user_id uuid
			constraint c_user_robot_userlist_fk
			references userlist,	
	robot_status    integer default 0 not null,
	quantity        numeric           not null,		
	balance_init    numeric default 0 not null,
	balance_current numeric default 0 not null,
	last_started    timestamp default CURRENT_DATE not null			
);

create unique index c_user_robot_uk on user_robot (robot_id,user_id);
create index i_user_robot_userlist_fk on userlist (id);

alter table user_robot add constraint c_user_robot_status_chk check (robot_status in (-1, 0, 1, 10, 20));

comment on column user_robot.robot_status is '
-1 - deleted
0 - added to favorites (default)
1 - subscribed to signals
10 - running
20 - paused';

comment on column user_robot.quantity is 'Trade volume for a robot';

comment on table user_robot is 'User subscription for a robot';


