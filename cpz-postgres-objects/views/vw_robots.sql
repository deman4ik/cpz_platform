drop view vw_robots;

create or replace view vw_robots as
SELECT u.id           as uidUSER_ROBOT_ID,
       u.user_id      as uidUSER_ID,
       u.robot_id     as nROBOT_ID,
       u.name         as sROBOT_NAME,
       u.asset        as sASSET,
       u.currency     as sCURRENCY,
       r.currate      as nCURRATE,
       u.exchange     as sEXCHANGE,
       u.timeframe    as nTIMEFRAME,
       u.volume                     as nVOLUME,   -- volume in coins
       round(u.volume*r.currate,2)  as nVOLUME_C, -- volume in currency
       round(u.profit/r.currate,8)  as nPROFIT,   -- performance in coins
       u.profit                     as nPROFIT_C, -- performance in currency
       round( u.profit/(u.balance_init+u.profit)*100,2 )   as nPROFIT_PCN, -- performance %
       round( u.profit/(u.balance_init+u.profit)*100,2 )   as nPROFIT_PCN_C, -- performance in currency %
       round(u.balance_init/r.currate,8)    as nBALANCE_INIT, -- "Initial capital" in coins
       u.balance_init                       as nBALANCE_INIT_C, -- "Initial capital" in currency
       round((u.balance_init+u.profit)/r.currate,8)  as nBALANCE_CURRENT, -- "Robot balance" in coins !!2DO
       (u.balance_init+u.profit)                     as nBALANCE_CURRENT_C, -- "Robot balance" in currency
       r.currency     as sCURCODE, -- todo change to symbol
       u.last_started as dSTARTED,
       u.dt_from      as dFROM,
       u.dt_to        as dTO,
       date_part('day',(CURRENT_DATE-u.last_started)) as nDAYS_ACTIVE,
       u.robot_status as nSTATUS,
       u.enabled      as nENABLED,
       u.linked_user_robot_id as uidLINKED_USER_ROBOT_ID,
       (select
          json_agg ( row_to_json(p) )
          from (
            select pf.dDATE, pf.nprofit_c as nPROFIT
            from vw_user_robot_performance_d pf
            where
               pf.uiduser_robot_id = u.id
            --order by pf.dDATE asc
          ) p
       ) as jPERF_ARRAY, -- performance mini-chart
       (select
          row_to_json(tt)
          from (
            select
            (select to_date(s.note,'dd.mm.yyyy')::timestamp from robot_statistics s where s.user_robot_id = d.id and s.stat_name = 'Max Drawdown Date') as DDATE,
            (select s.all_trades from robot_statistics s where s.user_robot_id = d.id and s.stat_name = 'Max Drawdown') as nMDD_C
            from
            user_robot d where id = u.id
          ) tt  limit  1
       )  as  jMDD, -- max draw down
       (select
          json_build_object('date',candle_timestamp, 'price',price,'action', action,'note', order_type)
          from signal s
          where s.robot_id = u.robot_id
            and s.backtest_id is null
            and s.candle_timestamp in (select max(candle_timestamp) from signal where robot_id = u.robot_id)
          limit 1
       ) as jLAST_SIGNAL -- last signal
FROM
  (select
     uu.*,
     r.name, r.asset, r.currency, r.exchange, r.timeframe, r.enabled,
     (select sum(profit)
         from positions
         where
           run_mode != 'backtest' and
           user_id = uu.user_id and robot_id = uu.robot_id
     ) as profit -- !!2DO
   from
     user_robot uu,
     robot r
   where
         uu.robot_id = r.id
     and r.enabled >= 10 -- 10 - for signals only or 20 - enabled for subscription
     and uu.linked_user_robot_id is null -- public only
     and uu.robot_status >= 0 -- not deleted
     and exists (select null from userroles ur where ur.user_id = uu.user_id and ur.role_id = 'public_robot')
  ) u,
  v_currate_c r
WHERE
  u.exchange = r.exchange and u.currency = r.currency and u.asset = r.asset
;