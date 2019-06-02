drop view v_currate_c;

create or replace view v_currate_c as
select
  a.id,
  a.asset,
  a.currency,
  a.exchange,
  (select max(rate) OVER (partition by asset, currency order by date_on desc) as currate
     from currate h where currency = a.currency and asset = a.asset
     limit 1) as currate
from exchange_pair a;

alter table v_currate_c
  owner to cpz;

