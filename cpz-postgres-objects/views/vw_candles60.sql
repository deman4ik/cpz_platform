drop view vw_candles60;

create view vw_candles60 as
SELECT t."timestamp",
       t."time",
       t.open as o,
       t.high as h,
       t.low  as l,
       t.close as c,
       t.volume as v,
       t.exchange,
       t.asset,
       t.currency
FROM candles60 t
where t.type != 'previous';

alter table vw_candles60
  owner to cpz;