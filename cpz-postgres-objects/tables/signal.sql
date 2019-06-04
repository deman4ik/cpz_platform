create table signal
(
    id          uuid constraint c_signal_pk primary key not null, 
    robot_id   numeric(17) not null
        constraint c_signal_robot_fk
        references robot on delete cascade,
    alert_time timestamp,        
    action     varchar(10) not null,
    price      numeric     not null,
    order_type varchar(10) not null,
    price_source varchar(10) not null default 'close',
    is_archive numeric(1)  not null default 0,
    settings   jsonb,
    adviser_id uuid,
    backtest_id   uuid
      constraint c_positions_backtest_fk
      references backtest
        ON DELETE CASCADE,
    position_id uuid not null,
    candle_timestamp timestamp,
    candle_id uuid,
    signal_type varchar(10) 
)
with OIDS;

alter table signal
  add constraint c_signal_action_chk
    check (action in ('long','closeLong','short','closeShort'));

alter table signal
  add constraint c_signal_type_chk
    check (signal_type in ('alert','trade'));
    
alter table signal
  add constraint c_signal_order_type_chk
    check (order_type in ('stop','limit','market'));

alter table signal
  add constraint c_signal_price_source_chk
    check (price_source in ('open','close','high','low','stop'));    

create index i_signal_robot_fk on signal (robot_id);
create index i_signal_alert_time on signal (alert_time);
create index i_signal_is_archive on signal (is_archive);
create index i_signal_backtest_fk   on signal (backtest_id);
create index i_signal_position_id   on signal (position_id);

comment on column signal.alert_time is 'system time';
  
comment on table signal is 'current active signals';