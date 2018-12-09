create table asset
(
    code          varchar(10) not null
    	constraint c_asset_pk primary key,
    name          varchar(160),
  	enabled 			integer not null default 20
);
alter table asset
	add constraint c_asset_enabled_chk
		check (enabled in (0,10,20));
		
comment on column asset.enabled is '
0 - disabled
10 - admin only
20 - public';

alter table asset owner to cpz;