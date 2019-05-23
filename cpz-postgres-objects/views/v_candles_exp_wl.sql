drop view v_candles_exp_wl;

create or replace view v_candles_exp_wl as
select
'<TICKER>' AS TICKER,'<PER>' as PER,'<DATE>' as "DATE", '<TIME>' as "TIME",'<OPEN>' as OPEN,'<HIGH>' as HIGH,'<LOW>' as LOW,'<CLOSE>' as CLOSE,'<VOL>' as VOL
union all
(select
  /*to change dataset name and timeframe !!*/
  'KRAKEN.BTC-USD', 30::varchar,
  
  to_char(t.timestamp, 'YYYYMMDD'), to_char(t.timestamp, 'HH24MISS'), open::varchar, high::varchar, low::varchar, close::varchar, volume::varchar
  /*to change timeframe table*/
  from candles30 t
  where 
   /*to change parameters for export*/
   asset = 'BTC' 
   and currency = 'USD' 
   and exchange = 'kraken'
   and t.timestamp >= '2019-02-15 18:00:00.000000'
   and t.timestamp <  '2019-05-01 23:00:00.000000'
  ORDER by t.timestamp asc
);