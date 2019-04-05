drop view vw_candles_p1;

create or replace view vw_candles_p1 as
SELECT t."timestamp",
       t."time",
       t.open,
       t.high,
       t.low,
       t.close,
       t.volume,
       t.exchange,
       t.asset,
       t.currency,
       t.user_id,
       t.robot_id,
       t.user_robot_id,
       t.linked_user_robot_id,
       t.robot_volume,
       ur.volume as linked_user_robot_volume,
       t.robot_status,
       case when o.candle_timestamp is not null then
              json_build_object('date',o.candle_timestamp, 'price',o.exec_price, 'action',o.action, 'note',o.order_type)
            else
              null
       end as jPOS
       
FROM 
  -- multiply to all followed user robots
  (select c.*, ul.user_id, ul.robot_id, ul.id as user_robot_id, ul.linked_user_robot_id, ul.volume as robot_volume, ul.robot_status
   from candles1 c, user_robot ul where ul.robot_status = 1 /*and t.type != 'previous'*/) t
  left join orders o on t.timestamp = o.candle_timestamp
                    and t.exchange  = o.exchange
                    and t.asset     = o.asset
                    and t.currency  = o.currency
                    and o.timeframe = 1
                    --and o.run_mode != 'backtest'
                    and o.backtest_id is null
                    and o.status    = 'closed'
  left join user_robot ur on o.robot_id = ur.robot_id and o.user_id = ur.user_id and t.linked_user_robot_id = ur.id

UNION ALL
SELECT t."timestamp",
       t."time",
       t.open,
       t.high,
       t.low,
       t.close,
       t.volume,
       t.exchange,
       t.asset,
       t.currency,
       t.user_id,
       t.robot_id,
       t.user_robot_id,
       null as linked_user_robot_id,
       t.robot_volume,
       ur.volume as linked_user_robot_volume,
       t.robot_status,
       case when o.candle_timestamp is not null then
              json_build_object('date',o.candle_timestamp, 'price',o.exec_price, 'action',o.action, 'note',o.order_type)
            else
              null
       end as jPOS
       
FROM 
  -- multiply to all own user robots (including public)
  (select c.*, ul.user_id, ul.robot_id, ul.id as user_robot_id, ul.volume as robot_volume, ul.robot_status
   from candles1 c, user_robot ul where ul.linked_user_robot_id is null/*and t.type != 'previous'*/) t
  left join orders o on t.timestamp = o.candle_timestamp
                    and t.exchange  = o.exchange
                    and t.asset     = o.asset
                    and t.currency  = o.currency
                    and o.timeframe = 1
                    --and o.run_mode != 'backtest'
                    and o.backtest_id is null
                    and o.status    = 'closed'
  left join user_robot ur on o.robot_id = ur.robot_id and o.user_id = ur.user_id and t.user_robot_id = ur.id
;

alter table vw_candles_p1
  owner to cpz;