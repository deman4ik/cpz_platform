create table exchange
(
  code               varchar(10)    not null
    constraint c_exchange_pk
    primary key,
  name               text    not null,
  enabled 					 integer not null default 20
);
alter table exchange
	add constraint c_exchange_enabled_chk
		check (enabled in (0,10,20));
		
comment on column exchange.enabled is '
0 - disabled
10 - admin only
20 - public';

comment on table exchange is 'Cryptocurrency exchanges';

alter table exchange owner to cpz;

