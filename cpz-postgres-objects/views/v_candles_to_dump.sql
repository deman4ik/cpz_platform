create view v_candles_to_dump as
SELECT t."timestamp",
       t.open,
       t.high,
       t.low,
       t.close,
       t.volume
FROM candles60 t
WHERE (((t.asset)::text = 'BTC'::text) AND ((t.currency)::text = 'USD'::text) AND
       ((t.exchange)::text = 'coinbasepro'::text) AND
       (t."timestamp" > '2018-01-01 00:00:00'::timestamp without time zone))
ORDER BY t."timestamp";

alter table v_candles_to_dump
  owner to cpz;

