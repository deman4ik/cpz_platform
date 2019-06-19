create table positions
(
  id            uuid            not null,
  user_id       uuid
    constraint c_positions_userlist_fk
    references userlist         not null,    
  robot_id      numeric(17)     not null
    constraint c_positions_robot_fk
    references robot on delete cascade,
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
  direction     varchar(10)     not null,
  entry_date    timestamp,
  entry_price   numeric,
  exit_date     timestamp,
  exit_price    numeric,

  slippage_step numeric,
  deviation     numeric,
  quantity      numeric,
  action        varchar(10),
  /*calculated*/
  bars_held     integer,
  entry_balance numeric,
  exit_balance  numeric,
  profit        numeric,
  historic      integer         not null default 0,  
  trader_id     uuid,
  backtest_id   uuid
    constraint c_positions_backtest_fk
      references backtest
        ON DELETE CASCADE,
  run_mode  varchar(10),
  reason    varchar(20)  
) 
with OIDS;

alter table positions
  add constraint c_positions_uk
    unique ( user_id, robot_id, entry_date, entry_price, trader_id, backtest_id);

alter table positions
  add constraint c_positions_uk2
    unique ( user_id, robot_id, id);

alter table positions
  add constraint c_positions_status_chk
    check (status in ('none','new','open','closed','closedAuto','canceled','error'));

alter table positions
  add constraint c_positions_action_chk
    check (action in ('long','closeLong','short','closeShort'));

alter table positions
  add constraint c_positions_direction_chk
    check (direction in ('buy','sell'));

alter table positions
  add constraint c_positions_run_mode_chk
    check (run_mode in ('emulator','realtime','backtest'));
        
create index i_positions_dates
  on positions (user_id, robot_id, entry_date, exit_date);
create index i_positions_user_robot
  on positions (user_id, robot_id, run_mode);
create index i_positions_user_robot_status
  on positions (user_id, robot_id, status);  
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
create index i_positions_backtest_fk
  on positions (backtest_id);
create index i_positions_run_mode
  on positions (run_mode);
  
comment on column positions.id is 'positopn id from adviser, not unique!';
comment on column positions.action is 'short | closeShort | long | closeLong';
comment on column positions.bars_held is '= duration / candle size';
comment on column positions.entry_balance is '= entry_price * quantity';
comment on column positions.exit_balance is '= exit_price * quantity';
comment on column positions.entry_date is 'entry CANDLE date';
comment on column positions.exit_date is 'exit CANDLE date';
comment on column positions.historic is '0 - normal, 1 - uploaded historic data, not generated inside the system';
comment on column positions.trader_id is 'trader process id | becktester process id';
comment on column positions.code is 'user code/number for particular position, comes from strategy';
comment on column positions.signal_id is 'last signal for open or close';
comment on column positions.reason is 'cause of an emergency';

comment on table positions is 'Positions = round trips';
