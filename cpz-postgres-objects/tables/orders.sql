create table orders
(
    id            uuid 
        constraint c_orders_pk
        primary key not null,
    position_id   uuid not null
        /*constraint c_orders_position_fk
        references positions not null
          ON DELETE CASCADE*/,
    user_id       uuid 
        constraint c_orders_userlist_fk
        references userlist not null,
    robot_id      numeric(17)     not null
        constraint c_orders_robot_fk
        references robot,
    exchange      varchar(30)     not null
        constraint c_orders_exchange_fk
        references exchange,
    asset         varchar(10)     not null
        constraint c_orders_asset_fk
        references asset,
    currency      varchar(10)     not null
        constraint c_orders_currency_fk
        references currency,
    timeframe     integer         not null,
    created_at    timestamp       not null,
    status        varchar(10)     not null default 'none',
    action        varchar(10)     not null,
        
    order_type    varchar(20)     not null,    
    order_time    timestamp,
    order_ex_num    varchar(160),
    order_price     numeric       default 0,
    order_quantity  numeric       default 0,
    
    exec_time       timestamp,
    exec_price      numeric       default 0,
    exec_quantity   numeric       default 0,
    remain_quantity numeric       default 0,

    signal_id     uuid,
    backtest_id   uuid
      constraint c_orders_backtest_fk
        references backtest
          ON DELETE CASCADE,
    trader_id     uuid,
    candle_timestamp timestamp,
    run_mode  varchar(10)
)
with OIDS;

alter table orders
  add constraint c_orders_action_chk
    check (action in ('long','closeLong','short','closeShort'));

alter table orders
  add constraint c_orders_order_type_chk
    check (order_type in ('limit','market','marketForce','stop'));

alter table orders
  add constraint c_orders_run_mode_chk
    check (run_mode in ('emulator','realtime'));
            
alter table orders
  add constraint c_orders_status_chk
    check (status in ('none','open','closed','canceled'));
                
create index i_orders_userlist_fk
  on orders (user_id);
create index i_orders_robot_fk
  on orders (robot_id);
create index i_orders_exchange_fk
  on orders (exchange);
create index i_orders_asset_fk
  on orders (asset);
create index i_orders_currency_fk
  on orders (currency);

create index i_orders_positions_fk
  on orders (position_id);
create index i_orders_signal
  on orders (signal_id);
create index i_orders_sel_user_date
  on orders (user_id, created_at);

comment on column orders.created_at is 'time of issuing order inside the system';
comment on column orders.order_ex_num is 'external order number from Exchange';
comment on column orders.order_time is 'time of posting order to exchange';
comment on column orders.order_price is 'price of asset to send to exchange including slippage, comes from robot settings,';
comment on column orders.order_quantity is 'quantity (volume) of asset to trade, comes from robot settings';

comment on column orders.exec_time is 'time of execution order inside an exchange';
comment on column orders.exec_price is 'order price from Exchange = "average price"';
comment on column orders.exec_quantity is 'quantity (volume) of asset in the order has been executed on Exchange';

comment on column orders.remain_quantity is 'quantity (volume) of asset remaining to execute to exchange, = 0 if all of order_quantity is executed';

comment on table orders is 'Orders for position';