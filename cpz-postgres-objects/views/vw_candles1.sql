create view vw_candles1 as
SELECT t."timestamp",
       t."time",
       json_build_object('o', t.open, 'h', t.high, 'l', t.low, 'c', t.close, 'v', t.volume, 'ts',
                         t."timestamp") AS jcandle
FROM candles1 t;

alter table vw_candles1
  owner to cpz;