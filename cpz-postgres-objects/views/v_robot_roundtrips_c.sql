create or replace view v_robot_roundtrips_c
  as
  select ttt.*,
    case when max_prepare = c_balance then 0 else (max_prepare - c_balance) * (-1) end
    as drawdown
  from (
    select
        tt.*,
        max(tt.c_balance) over (
            partition by tt.robot
            ORDER BY tt.entry_date asc, tt.exit_date asc, tt.id asc
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) as max_prepare
    from
      (select
         t.robot,
         t.id,
         t.quantity,
         t.action,
         t.entry_date,
         t.entry_price,
         t.exit_date,
         t.exit_price,
         t.bars_held,
         t.profit$,
         t.entry_balance,
         t.exit_balance,
         round(
             sum(t.profit$) over (
               partition by robot
               ORDER BY entry_date asc, exit_date asc, id asc
               ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
             )
          ,2) as c_balance
         from trade_roundtrips t
         order by entry_date asc, exit_date asc, id asc
      ) tt
    ) ttt
;