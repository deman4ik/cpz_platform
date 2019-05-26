drop view vw_candles1440;

create view vw_candles1440 as
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
FROM candles1440 t
where t.type != 'previous';

alter table vw_candles1440
  owner to cpz;