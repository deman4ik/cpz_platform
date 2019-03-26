create table currency
(
    code         varchar(10) not null
      constraint c_currency_pk primary key,
    name         varchar(160) not null,
    country_name varchar(160),
  	enabled 		 integer not null default 20,
  	enabled_for_equiv_display integer not null default 0;
);
alter table currency
	add constraint c_currency_enabled_chk
		check (enabled in (0,10,20));
alter table currency
	add constraint c_currency_enabled_for_equiv_display_chk
		check (enabled_for_equiv_display in (0,1));		
		
comment on column currency.enabled is '
0 - disabled
10 - admin only
20 - public';

alter table currency owner to cpz;