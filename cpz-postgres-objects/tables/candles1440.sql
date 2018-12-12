create table candles1440
(
  id        uuid      not null
    constraint c_candles1440_pk
    primary key,
  time      bigint    not null,
  timestamp timestamp not null,
  open      numeric   not null,
  high      numeric   not null,
  low       numeric   not null,
  close     numeric   not null,
  volume    numeric   not null,
  exchange  varchar(30)      not null
    constraint c_candles1440_exchange_fk
    references exchange,
  asset     varchar(10)      not null
    constraint c_candles1440_asset_fk
    references asset,
  currency  varchar(10)      not null
    constraint c_candles1440_currency_fk
    references currency,
  type      varchar(10)      not null
)
with OIDS;

alter table candles1440
  add constraint c_candles1440_type_chk
    check (type in ('created', 'loaded', 'previous', 'imported'));

alter table candles1440
  add constraint c_candles1440_uk
    unique (time, currency, asset, exchange);

create index i_candles1440_currency_fk on candles1440 (currency);
create index i_candles1440_asset_fk on candles1440 (asset);
create index i_candles1440_exchange_fk on candles1440 (exchange);
create index i_candles1440_select1 on candles1440 (exchange, currency, asset);

comment on table candles1440 is 'Candles in 1 day (1440 min) timeframe';
    
alter table candles1440 owner to cpz;

