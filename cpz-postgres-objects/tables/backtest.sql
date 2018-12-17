create table backtest
(
  id                            uuid
    constraint c_backtest_pk
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
  timeframe       integer       not null,  
  dt_from         timestamp     not null,
  dt_to           timestamp     not null,  
  run_mode        varchar(10)   not null,
  status          varchar(10)   not null,
  started_at      timestamp     default CURRENT_DATE not null,
  ended_at        timestamp,
  total_bars      numeric(10),
  processed_bars  numeric(10),
  note            text,
  advisersettings  jsonb,
  tradersettings   jsonb
) 
with OIDS;

alter table backtest
  add constraint c_backtest_status_chk
    check (status in ('started','stopped','finished','error'));

alter table backtest
  add constraint c_backtest_run_mode_chk
    check (run_mode in ('backtest','emulator','realtime'));

    
create index i_backtest_status
  on backtest (status);


comment on column backtest.status is 'started | stopped | finished | error';


comment on table backtest is 'Backtest history for a robot. Developers only.';

