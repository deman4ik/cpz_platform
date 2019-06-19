create or replace function f_currate_dt(nFLAG_EX in integer, sCUR in varchar, sASSET in varchar, dDATE_ON date) returns numeric
	language plpgsql
as $$
DECLARE
  nRATE numeric;
BEGIN
  begin
    select max(h.rate) OVER (partition by h.asset, h.currency order by h.date_on desc) as last_rate
    into nRATE
    from cpz.currate h
    where h.currency = sCUR and h.asset = sASSET and h.date_on <= dDATE_ON 
    limit 1;
  exception when NO_DATA_FOUND then
    if nFLAG_EX = 1 then
      null;
    else
      raise;
    end if;
  end;
  RETURN nRATE;
END;
$$
;
