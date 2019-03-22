drop view vw_candles1;

create view vw_candles1 as
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
FROM candles1 t
where t.type != 'previous';

alter table vw_candles1
  owner to cpz;