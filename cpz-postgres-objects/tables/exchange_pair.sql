create table exchange_pair
(
  id         numeric(17)  not null default nextval('cpz_id_seq'::regclass)
    constraint c_exchange_pair_pk
    primary key,
  exchange   varchar(10)  not null
    constraint c_exchange_pair_exchange_fk
    references exchange,
  currency   varchar(10)  not null
    constraint c_exchange_pair_currency_fk
    references currency,
  asset      varchar(10)  not null
    constraint c_exchange_pair_asset_fk
    references asset,
  enabled    integer       not null default 20    
);

alter table exchange_pair
  add constraint c_exchange_pair_uk
    unique ( exchange, currency, asset);

alter table exchange_pair
  add constraint c_exchange_pair_enabled_chk
    check (enabled in (0,10,20));
    
comment on column exchange_pair.enabled is '
0 - disabled
10 - admin only
20 - public';

create index i_exchange_pair_currency_fk on exchange_pair (currency);
create index i_exchange_pair_exchange_fk on exchange_pair (exchange);
create index i_exchange_pair_asset_fk on exchange_pair (asset);
    
alter table exchange_pair owner to cpz;
comment on table exchange_pair is 'asset-currency pairs supported by exchange';