drop view vw_candles15;

create view vw_candles15 as
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
FROM candles60 t
where t.type != 'previous';

alter table vw_candles15
  owner to cpz;