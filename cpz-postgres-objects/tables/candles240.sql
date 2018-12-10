create table candles240
(
  id        uuid      not null
    constraint c_candles240_pk
    primary key,
  time      bigint    not null,
  timestamp timestamp not null,
  open      numeric   not null,
  high      numeric   not null,
  low       numeric   not null,
  close     numeric   not null,
  volume    numeric   not null,
  exchange  varchar(10)      not null
    constraint c_candles240_exchange_fk
    references exchange,
  asset     varchar(10)      not null
    constraint c_candles240_asset_fk
    references asset,
  currency  varchar(10)      not null
    constraint c_candles240_currency_fk
    references currency,
  type      varchar(10)      not null
)
with OIDS;

alter table candles240
  add constraint c_candles240_type_chk
    check (type in ('created', 'loaded', 'previous'));

alter table candles240
  add constraint c_candles240_uk
    unique (time, currency, asset, exchange);

create index i_candles240_currency_fk on candles240 (currency);
create index i_candles240_asset_fk on candles240 (asset);
create index i_candles240_exchange_fk on candles240 (exchange);
create index i_candles240_select1 on candles240 (exchange, currency, asset);

comment on table candles240 is 'Candles in 4 hours timeframe';
    
alter table candles240 owner to cpz;

