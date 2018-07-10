create or replace view v_robot_roundtrips
  as
    select
      t.robot,
      t.id as roundtripId,
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
      t.historic
    from trade_roundtrips t
    order by t.entry_date desc;