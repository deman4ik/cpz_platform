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



