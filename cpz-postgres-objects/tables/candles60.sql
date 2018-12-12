create table candles60
(
  id        uuid      not null
    constraint c_candles60_pk
    primary key,
  time      bigint    not null,
  timestamp timestamp not null,
  open      numeric   not null,
  high      numeric   not null,
  low       numeric   not null,
  close     numeric   not null,
  volume    numeric   not null,
  exchange  varchar(30)      not null
    constraint c_candles60_exchange_fk
    references exchange,
  asset     varchar(10)      not null
    constraint c_candles60_asset_fk
    references asset,
  currency  varchar(10)      not null
    constraint c_candles60_currency_fk
    references currency,
  type      varchar(10)      not null
)
with OIDS;

alter table candles60
  add constraint c_candles60_type_chk
    check (type in ('created', 'loaded', 'previous', 'imported'));

alter table candles60
  add constraint c_candles60_uk
    unique (time, currency, asset, exchange);

create index i_candles60_currency_fk on candles60 (currency);
create index i_candles60_asset_fk on candles60 (asset);
create index i_candles60_exchange_fk on candles60 (exchange);
create index i_candles60_select1 on candles60 (exchange, currency, asset);

comment on table candles60 is 'Candles in 1 hour timeframe';
    
alter table candles60 owner to cpz;

