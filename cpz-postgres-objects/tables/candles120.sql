create table candles120
(
  id        uuid      not null
    constraint c_candles120_pk
    primary key,
  time      bigint    not null,
  timestamp timestamp not null,
  open      numeric   not null,
  high      numeric   not null,
  low       numeric   not null,
  close     numeric   not null,
  volume    numeric   not null,
  exchange  varchar(10)      not null
    constraint c_candles120_exchange_fk
    references exchange,
  asset     varchar(10)      not null
    constraint c_candles120_asset_fk
    references asset,
  currency  varchar(10)      not null
    constraint c_candles120_currency_fk
    references currency,
  type      varchar(10)      not null
)
with OIDS;

alter table candles120
  add constraint c_candles120_type_chk
    check (type in ('created', 'loaded', 'previous'));

alter table candles120
  add constraint c_candles120_uk
    unique (time, currency, asset, exchange);

create index i_candles120_currency_fk on candles120 (currency);
create index i_candles120_asset_fk on candles120 (asset);
create index i_candles120_exchange_fk on candles120 (exchange);
create index i_candles120_select1 on candles120 (exchange, currency, asset);

comment on table candles120 is 'Candles in 2 hours timeframe';
    
alter table candles120 owner to cpz;

