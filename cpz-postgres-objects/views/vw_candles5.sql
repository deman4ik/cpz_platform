create or replace view vw_candles5 as
SELECT t."timestamp",
       t."time",
       json_build_object('o', t.open, 'h', t.high, 'l', t.low, 'c', t.close, 'v', t.volume, 'ts',
                         t."timestamp") AS jcandle
FROM candles5 t;

alter table vw_candles5
  owner to cpz;