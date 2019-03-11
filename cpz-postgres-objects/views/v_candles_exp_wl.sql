drop view v_candles_exp_wl;

create view v_candles_exp_wl as
select
'<TICKER>' AS TICKER,'<PER>' as PER,'<DATE>' as "DATE", '<TIME>' as "TIME",'<OPEN>' as OPEN,'<HIGH>' as HIGH,'<LOW>' as LOW,'<CLOSE>' as CLOSE,'<VOL>' as VOL
union all
(select
  /*to change dataset name and timeframe !!*/
  'KRAKEN.BTC-USD', 1::varchar, 
  
  to_char(t.timestamp, 'YYYYMMDD'), to_char(t.timestamp, 'HH24MISS'), open::varchar, high::varchar, low::varchar, close::varchar, volume::varchar
  /*to change timeframe table*/
  from candles1 t 
  where 
   /*to change parameters for export*/
   asset = 'BTC' 
   and currency = 'USD' 
   and exchange = 'kraken'
   and t.timestamp >= '2019-01-03 22:30:00.000000' 
   and t.timestamp < '2019-01-04 05:00:00.000000'
  ORDER by t.timestamp asc
);