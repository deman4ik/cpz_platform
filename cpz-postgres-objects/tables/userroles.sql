create table userroles
(
  id         numeric(17)  not null default nextval('cpz_id_seq'::regclass)
    constraint c_userroles_pk
    primary key,
	user_id uuid not null
			constraint c_userroles_user_fk
			references userlist
			on delete cascade,
	role_id varchar(40)
);

alter table userroles
  add constraint c_userroles_uk1
    unique (user_id, role_id);


alter table userroles
  add constraint c_userroles_role_id_chk
    check (role_id in ('admin','user','moderator','public_robot'));