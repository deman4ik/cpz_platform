create table signal
(
    id          uuid constraint c_signal_pk primary key not null, 
    robot_id   numeric(17) not null
        constraint c_signal_robot_fk
        references robot,
    alert_time timestamp,        
    action     varchar(10) not null,
    price      numeric     not null,
    quantity   numeric     not null,
    order_type varchar(10) not null,
    price_source varchar(10) not null default 'close',
    is_archive numeric(1)  not null default 0,
    candle     jsonb,
    params     jsonb

)
with OIDS;

alter table signal
  add constraint c_signal_action_chk
    check (action in ('long','closeLong','short','closeShort'));
    
alter table signal
  add constraint c_signal_order_type_chk
    check (order_type in ('stop','limit','market'));

alter table signal
  add constraint c_signal_price_source_chk
    check (price_source in ('open','close','high','low','stop'));    

create index i_signal_robot_fk on signal (robot_id);
create index i_signal_alert_time_fk on signal (alert_time);
create index i_signal_is_archive_fk on signal (is_archive);

comment on table signal is 'current active signals';