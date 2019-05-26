drop view vw_candles30;

create view vw_candles30 as
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
FROM candles30 t
where t.type != 'previous';

alter table vw_candles30
  owner to cpz;