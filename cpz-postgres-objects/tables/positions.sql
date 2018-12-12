create table positions
(
  id                            uuid
    constraint c_positions_pk
    primary key                 not null,
  user_id       uuid
    constraint c_positions_userlist_fk
    references userlist         not null,    
  robot_id      numeric(17)     not null
    constraint c_positions_robot_fk
    references robot,
  exchange      varchar(30)     not null
    constraint c_positions_exchange_fk
    references exchange,
  asset         varchar(10)     not null
    constraint c_positions_asset_fk
    references asset,
  currency      varchar(10)     not null
    constraint c_positions_currency_fk
    references currency,
  code          varchar(20),    
  timeframe     integer         not null,
  status        varchar(10)     not null default 'none',
  entry_status  varchar(10)     not null default 'none',
  exit_status   varchar(10)     not null default 'none',
  entry_date    timestamp       not null,
  entry_price   numeric,
  exit_date     timestamp,
  exit_price    numeric,

  slippage_step numeric         not null default 0,
  deviation     numeric         not null default 0,
  quantity      numeric         not null,
  run_mode      varchar(10)     not null,
  action        varchar(10),
  /*calculated*/
  bars_held     integer,
  entry_balance numeric,
  exit_balance  numeric,
  profit        numeric,
  historic      integer         not null default 0,
  signal_id     uuid,      
  trader_id     uuid 
) 
with OIDS;

alter table positions
  add constraint c_positions_uk
    unique ( user_id, robot_id, entry_date, entry_price, signal_id, trader_id);

alter table positions
  add constraint c_positions_status_chk
    check (status in ('none','opened','posted','closed','canceled','error'));

alter table positions
  add constraint c_positions_run_mode_chk
    check (run_mode in ('backtest','emulator','realtime'));

alter table positions
  add constraint c_positions_action_chk
    check (action in ('long','closeLong','short','closeShort'));

create index i_positions_dates
  on positions (robot_id, entry_date, exit_date);

create index i_positions_userlist_fk
  on positions (user_id);
create index i_positions_robot_fk
  on positions (robot_id);
create index i_positions_exchange_fk
  on positions (exchange);
create index i_positions_asset_fk
  on positions (asset);
create index i_positions_currency_fk
  on positions (currency);

comment on column positions.action is 'short | closeShort | long | closeLong';
comment on column positions.bars_held is '= duration / candle size';
comment on column positions.entry_balance is '= entry_price * quantity';
comment on column positions.exit_balance is '= exit_price * quantity';
comment on column positions.historic is '0 - normal, 1 - uploaded historic data, not generated inside the system';
comment on column positions.trader_id is 'trader process id | becktester process id';
comment on column positions.code is 'user code/number for particular position, comes from strategy';

comment on table positions is 'Positions = round trips';
