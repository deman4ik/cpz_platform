create table candles30
(
  id        uuid      not null
    constraint c_candles30_pk
    primary key,
  time      bigint    not null,
  timestamp timestamp not null,
  open      numeric   not null,
  high      numeric   not null,
  low       numeric   not null,
  close     numeric   not null,
  volume    numeric   not null,
  exchange  varchar(10)      not null
    constraint c_candles30_exchange_fk
    references exchange,
  asset     varchar(10)      not null
    constraint c_candles30_asset_fk
    references asset,
  currency  varchar(10)      not null
    constraint c_candles30_currency_fk
    references currency,
  type      varchar(10)      not null
)
with OIDS;

alter table candles30
  add constraint c_candles30_type_chk
    check (type in ('created', 'loaded', 'previous', 'imported'));

alter table candles30
  add constraint c_candles30_uk
    unique (time, currency, asset, exchange);

create index i_candles30_currency_fk on candles30 (currency);
create index i_candles30_asset_fk on candles30 (asset);
create index i_candles30_exchange_fk on candles30 (exchange);
create index i_candles30_select1 on candles30 (exchange, currency, asset);

comment on table candles30 is 'Candles in 30 minutes timeframe';
    
alter table candles30 owner to cpz;

