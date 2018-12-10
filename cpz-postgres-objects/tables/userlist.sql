create table userlist
(
  id uuid not null constraint c_userlist_pk primary key,
  email varchar(160) not null,
  first_name varchar(160) not null,
  last_name varchar(160),
  reg_date date default CURRENT_DATE not null,
  status integer default 1 not null,
  phone varchar(20),
  telegram varchar(160)
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