create table backtest_wl
(
  id                            uuid
    constraint c_backtest_wl_pk
    primary key                 not null,
  dt_from         timestamp     not null,
  dt_to           timestamp     not null,  
  settings  jsonb
) 
with OIDS;

comment on table backtest_wl is 'Backtest history from Wealth Lab. Developers only.';

