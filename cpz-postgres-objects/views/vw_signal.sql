drop view vw_signal;

create view vw_signal as
select
  id,
  robot_id,
  alert_time,
  action,
  price,
  order_type,
  price_source,
  params,
  adviser_id,
  position_id,
  candle_timestamp,
  candle_id
from signal
where backtest_id is null
  and is_archive = 0
;