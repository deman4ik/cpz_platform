create table userlist
(
  id uuid not null constraint c_userlist_pk primary key,
  email varchar(160) not null,
  first_name varchar(160) not null,
  last_name varchar(160),
  reg_date date default CURRENT_DATE not null,
  status integer default 0 not null,
  phone varchar(20),
  telegram varchar(160),
  pwdhash text,
  refresh_tokens text,
  reg_code varchar(10),
  bad_login_count integer default 0,
  bad_regcode_count integer default 0
);

alter table userlist
  add constraint c_userlist_uk1
    unique (email);

alter table userlist
  add constraint c_userlist_uk2
    unique (first_name, last_name);
    
alter table userlist
  add constraint c_userlist_uk3
    unique (phone);    

alter table userlist
  add constraint c_userlist_uk4
    unique (telegram);

alter table userlist
  add constraint c_userlist_status_chk
    check (status in (-1,0,1,2));

comment on column userlist.status is '-1 - deleted, 0 - temptorary disabled, 1 - normal (enabled), 2 - pending registration';