drop view vw_robots;

create view vw_robots as
SELECT u.id           AS uidUSER_ROBOT_ID,
       u.user_id      AS uidUSER_ID,
       u.robot_id     AS nROBOT_ID,
       u.name         AS sROBOT_NAME,
       u.asset        AS sASSET,
       u.currency     AS sCURRENCY,
       u.exchange     AS sEXCHANGE,
       u.timeframe    AS nTIMEFRAME,
       u.volume                    as nVOLUME, -- volume in coins
       round(u.volume*ncurrate,2)  as nVOLUME_C, -- volume in currency
       u.profit                    as nPROFIT, -- performance in coins
       u.profit*ncurrate           as nPROFIT_C, -- performance in currency
       round((u.balance_init+u.profit)/abs(u.profit)*100,2)   as nPROFIT_PCN, -- performance %
       round((u.balance_init+u.profit)/abs(u.profit)*100,2)   as nPROFIT_PCN_C, -- performance in currency %
       u.balance_init              as nBALANCE_INIT, -- "Initial capital" in coins
       u.balance_init*ncurrate     as nBALANCE_INIT_C, -- "Initial capital" in currency
       (u.balance_init+u.profit)          as nBALANCE_CURRENT, -- "Robot balance" in coins !!2DO
       (u.balance_init+u.profit)*ncurrate as nBALANCE_CURRENT_C, -- "Robot balance" in currency
       r.sCURCODE     as sCURCODE,
       u.last_started AS dSTARTED,
       u.dt_from      AS dFROM,
       u.dt_to        AS dTO,
       date_part('day',(CURRENT_DATE-u.last_started)) as nDAYS_ACTIVE,
       u.robot_status AS nSTATUS,
       u.linked_user_robot_id as uidLINKED_USER_ROBOT_ID,
       (select
          json_agg ( row_to_json(p) )
        from (
          select pf.dDATE, round(pf.nprofit*ncurrate,2) as nPROFIT
          from vw_user_robot_performance pf
          where
                pf.ddate >= (current_date - 10)
            and pf.nrobot_id = u.robot_id and pf.uiduser_id = u.user_id
          order by dDATE asc
        ) p) as jPERF_ARRAY, -- performance mini-chart
        (select row_to_json(tt)
          from (
          select ddate, nMDD, nMDD*ncurrate as nMDD_C
          from (
            select ddate, nprofit,
                   lag(nprofit) over (order by ddate) as nprev,
                   (lag(nprofit) over (order by ddate))-nprofit as nMDD
            from vw_user_robot_performance pf
            where
              pf.nrobot_id = u.robot_id and pf.uiduser_id = u.user_id
          ) t order by nMDD asc
          ) tt  limit  1)  as  jMDD,
       (select json_build_object('date',candle_timestamp, 'price',price,'action', action,'note', order_type)
         from signal s
         where s.robot_id = u.robot_id
           and s.backtest_id is null
           and s.candle_timestamp in (select max(candle_timestamp) from signal where robot_id = u.robot_id)
         limit 1
       ) as jLAST_SIGNAL
FROM
  (select
     uu.*,
     r.name, r.asset, r.currency, r.exchange, r.timeframe,
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
     and uu.robot_status = 0
  ) u,
  (select 4012 as nCURRATE, '$' as sCURCODE) r
;