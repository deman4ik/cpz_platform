drop view v_robots;

create view v_robots as
SELECT u.id,
       u.user_id,
       u.robot_id,
       u.name,
       u.filename,
       u.strat_id,
       u.asset,
       u.currency,
       u.exchange,
       u.timeframe,
       u.volume, -- volume in coins
       u.profit, -- performance in coins
       round((u.balance_init+u.profit)/abs(u.profit)*100,2)   as PROFIT_PCN, -- performance %
       u.balance_init              as BALANCE_INIT, -- "Initial capital" in coins
       u.balance_init*ncurrate     as BALANCE_INIT_C, -- "Initial capital" in currency
       (u.balance_init+u.profit)          as BALANCE_CURRENT, -- "Robot balance" in coins !!2DO
       (u.balance_init+u.profit)*ncurrate as BALANCE_CURRENT_C, -- "Robot balance" in currency
       r.sCURCODE,
       u.last_started,
       u.dt_from,
       u.dt_to,
       date_part('day',(CURRENT_DATE-u.last_started)) as DAYS_ACTIVE,
       u.robot_status,
       u.linked_user_robot_id

FROM
  (select
     uu.*,
     r.name, r.asset, r.currency, r.exchange, r.timeframe,
     s.id as strat_id, s.filename,
     (select sum(profit)
         from positions
         where
           run_mode != 'backtest' and
           user_id = uu.user_id and robot_id = uu.robot_id
     ) as profit -- !!2DO
   from
     user_robot uu,
     robot r,
     strat s
   where
         uu.robot_id = r.id
     and r.strat = s.id
  ) u,
  (select 4012 as nCURRATE, '$' as sCURCODE) r
;