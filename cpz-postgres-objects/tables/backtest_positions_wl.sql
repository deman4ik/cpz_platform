create table backtest_positions_wl
(
  id                            uuid
    constraint c_backtest_positions_wl_pk
    primary key                 not null,
  code          varchar(20),
  type          varchar(30),
  entry_date    timestamp,
  entry_price   numeric,
  entry_signal  text,
  entry_order_type varchar(30),
  entry_bar     integer,
  exit_date     timestamp,
  exit_price    numeric,
  exit_signal   text,
  exit_order_type varchar(30),
  exit_bar      integer,
  backtest_id   uuid 
   constraint c_backtest_positions_wl_backtest_fk
      references backtest_wl
        ON DELETE CASCADE
) 
with OIDS;

        
create index i_backtest_positions_wl_dates
  on backtest_positions_wl (backtest_id, entry_date, exit_date);

create index i_backtest_positions_wl_backtest_fk
  on backtest_positions_wl (backtest_id);
  
