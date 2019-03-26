drop view vw_candles5;

create view vw_candles5 as
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
FROM candles5 t
where t.type != 'previous';

alter table vw_candles5
  owner to cpz;