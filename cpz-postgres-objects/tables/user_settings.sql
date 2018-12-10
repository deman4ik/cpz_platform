create table user_settings
(
	id  uuid
			constraint c_user_settings_pk
			primary key,
	user_id uuid not null
			constraint c_user_settings_user_fk
			references userlist
			on delete cascade,
	balance_equv_display varchar(10) default 'BTC'::character varying not null
			constraint c_user_settings_balance_disp_fk
			references asset,
	preferred_currency varchar(10) default 'USD'::character varying not null
			constraint c_user_settings_currency_fk
			references currency,
	notif_method varchar(240) default 'mail'::character varying not null
);


