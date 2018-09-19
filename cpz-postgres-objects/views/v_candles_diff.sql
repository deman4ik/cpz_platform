create or replace view V_CANDLES_DIFF
as select d.* from (
  SELECT
    t.start,
    t.timestamp,
    e.code as exchange,
	t.id,
	t.asset,
	t.currency,
    t.start - LAG(t.start, 1)
    OVER (
      ORDER BY
        t.start ) AS diff
  FROM candles t, exchanges e
  where t.exchange = e.id	
  ORDER BY t.start desc
) d
where diff is null or diff != 60;