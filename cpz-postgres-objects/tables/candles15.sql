create table candles15
(
  id        uuid      not null
    constraint c_candles15_pk
    primary key,
  time      bigint    not null,
  timestamp timestamp not null,
  open      numeric   not null,
  high      numeric   not null,
  low       numeric   not null,
  close     numeric   not null,
  volume    numeric   not null,
  exchange  varchar(10)      not null
    constraint c_candles15_exchange_fk
    references exchange,
  asset     varchar(10)      not null
    constraint c_candles15_asset_fk
    references asset,
  currency  varchar(10)      not null
    constraint c_candles15_currency_fk
    references currency,
  type      varchar(10)      not null
)
with OIDS;

alter table candles15
  add constraint c_candles15_type_chk
    check (type in ('created', 'loaded', 'previous'));

alter table candles15
  add constraint c_candles15_uk
    unique (time, currency, asset, exchange);

create index i_candles15_currency_fk on candles15 (currency);
create index i_candles15_asset_fk on candles15 (asset);
create index i_candles15_exchange_fk on candles15 (exchange);
create index i_candles15_select1 on candles15 (exchange, currency, asset);

comment on table candles15 is 'Candles in 15 minutes timeframe';
    
alter table candles15 owner to cpz;

