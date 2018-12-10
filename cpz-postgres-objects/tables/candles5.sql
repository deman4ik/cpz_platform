create table candles5
(
  id        uuid      not null
    constraint c_candles5_pk
    primary key,
  time      bigint    not null,
  timestamp timestamp not null,
  open      numeric   not null,
  high      numeric   not null,
  low       numeric   not null,
  close     numeric   not null,
  volume    numeric   not null,
  exchange  varchar(10)      not null
    constraint c_candles5_exchange_fk
    references exchange,
  asset     varchar(10)      not null
    constraint c_candles5_asset_fk
    references asset,
  currency  varchar(10)      not null
    constraint c_candles5_currency_fk
    references currency,
  type      varchar(10)      not null
)
with OIDS;

alter table candles5
  add constraint c_candles5_type_chk
    check (type in ('created', 'loaded', 'previous', 'imported'));

alter table candles5
  add constraint c_candles5_uk
    unique (time, currency, asset, exchange);

create index i_candles5_currency_fk on candles5 (currency);
create index i_candles5_asset_fk on candles5 (asset);
create index i_candles5_exchange_fk on candles5 (exchange);
create index i_candles5_select1 on candles5 (exchange, currency, asset);

comment on table candles5 is 'Candles in 5 minutes timeframe';
    
alter table candles5 owner to cpz;

