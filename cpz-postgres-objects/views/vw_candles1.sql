drop view vw_candles1;

create view vw_candles1 as
SELECT t."timestamp",
       t."time",
       t.open,
       t.high,
       t.low,
       t.close,
       t.volume,
       t.exchange,
       t.asset,
       t.currency
FROM candles1 t
where t.type != 'previous';

alter table vw_candles1
  owner to cpz;