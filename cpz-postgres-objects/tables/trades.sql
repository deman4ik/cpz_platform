create table trades
(
    id            uuid 
        constraint c_trades_pk
        primary key not null,
    position_id   uuid not null
        constraint c_trades_position_fk
        references positions not null
          ON DELETE CASCADE,
    user_id       uuid 
        constraint c_trades_userlist_fk
        references userlist not null,
    robot_id      numeric(17)     not null
        constraint c_trades_robot_fk
        references robot,
    exchange      varchar(30)     not null
        constraint c_trades_exchange_fk
        references exchange,
    asset         varchar(10)     not null
        constraint c_trades_asset_fk
        references asset,
    currency      varchar(10)     not null
        constraint c_trades_currency_fk
        references currency,
    timeframe     integer         not null,
    
    created_at    timestamp       not null,
    order_time    timestamp,
    order_num     varchar(160),
    order_type    varchar(10)     not null,
    status        varchar(10)     not null default 'none',
    action        varchar(10)     not null,
    price         numeric         not null,
    exec_quantity numeric,
    signal_id     uuid,
    candle_timestamp timestamp
)
with OIDS;

alter table trades
  add constraint c_trades_action_chk
    check (action in ('long','closeLong','short','closeShort'));

alter table trades
  add constraint c_trades_order_type_chk
    check (order_type in ('limit','market','stop'));
        
create index i_trades_userlist_fk
  on trades (user_id);
create index i_trades_robot_fk
  on trades (robot_id);
create index i_trades_exchange_fk
  on trades (exchange);
create index i_trades_asset_fk
  on trades (asset);
create index i_trades_currency_fk
  on trades (currency);

create index i_trades_positions_fk
  on trades (position_id);
create index i_trades_signal
  on trades (signal_id);
create index i_trades_sel_user_date
  on trades (user_id, created_at);

comment on column trades.created_at is 'time of issuing order inside the system';
comment on column trades.order_time is 'order time from Exchange';
comment on column trades.order_num is 'external order number from Exchange';
comment on column trades.price is 'order price from Exchange, not the signal price';
comment on column trades.exec_quantity is 'volume of asset in the order posted to Exchange';

comment on table trades is 'Orders for position';