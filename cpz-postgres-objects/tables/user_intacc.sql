create table user_intacc
(
	id  numeric(17)  not null default nextval('cpz_id_seq'::regclass)
		  constraint c_user_intacc_pk
			primary key,
	user_id uuid
			constraint c_user_intacc_userlist_fk
			references userlist,
	balance_init    numeric default 0 not null,
	balance_current numeric default 0 not null,
  currency        varchar(10) not null
    constraint c_user_intacc_currency_fk
    references currency on update cascade,
	dt_added    		timestamp default CURRENT_DATE not null, 
	acc_status			int default 1   
);

alter table user_intacc add constraint c_user_intacc_status_chk check (acc_status in (-1, 1));

comment on column user_intacc.acc_status is '
-1 - disabled
1  - enabled';

create index i_user_intacc_userlist_fk on userlist (id);

comment on table user_intacc is 'user internal account (1:1)';



