create table currate
(
    id              numeric(17) not null default nextval('cpz_id_seq'::regclass)
    constraint c_currate_pk
    primary key,
    date_on       timestamp,
    asset         varchar(10) not null
        constraint c_currate_asset_fk
        references asset,
  	qnt 			    integer     not null default 1,        
    currency      varchar(10) not null
        constraint c_currate_currency_fk
        references currency,
  	rate					numeric     not null 
);
alter table currate
  add constraint c_currate_uk
    unique ( date_on, currency, asset);

alter table currate owner to cpz;