create table user_exchacc
(
	id              uuid
		  constraint c_user_exchacc_pk
			primary key,
	user_id         uuid
			constraint c_user_exchacc_userlist_fk
			references userlist,
	balance_init    numeric      not null default 0,
	balance_current numeric      not null default 0,
  asset      		  varchar(10)  not null
    constraint c_user_exchacc_asset_fk
    references asset,
	exchange   			varchar(30)  not null
    constraint c_user_exchacc_exchange_fk
    references exchange,
	dt_added    		timestamp    not null default CURRENT_DATE, 
	acc_status			int          not null default 0   
);

alter table user_exchacc add constraint c_user_exchacc_status_chk check (acc_status in (-1, 0, 1));

create index i_user_exchacc_userlist_fk on user_exchacc (user_id);
	
comment on column user_exchacc.acc_status is '
-1 - disabled
0 - not verified
1 - verified and ready to use';

comment on table user_exchacc is 'User exchange accounts';



