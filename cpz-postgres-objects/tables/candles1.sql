create table candles1
(
  id        uuid      not null
    constraint c_candles1_pk
    primary key,
  time      bigint    not null,
  timestamp timestamp not null,
  open      numeric   not null,
  high      numeric   not null,
  low       numeric   not null,
  close     numeric   not null,
  volume    numeric   not null,
  exchange  varchar(10)      not null
    constraint c_candles1_exchange_fk
    references exchange,
  asset     varchar(10)      not null
    constraint c_candles1_asset_fk
    references asset,
  currency  varchar(10)      not null
    constraint c_candles1_currency_fk
    references currency,
  type      varchar(10)      not null
)
with OIDS;

alter table candles1
  add constraint c_candles1_type_chk
    check (type in ('created', 'loaded', 'previous'));

alter table candles1
  add constraint c_candles1_uk
    unique (time, currency, asset, exchange);

create index i_candles1_currency_fk on candles1 (currency);
create index i_candles1_asset_fk on candles1 (asset);
create index i_candles1_exchange_fk on candles1 (exchange);
create index i_candles1_select1 on candles1 (exchange, currency, asset);

comment on table candles1 is 'Candles in 1 minute timeframe';
    
alter table candles1 owner to cpz;

