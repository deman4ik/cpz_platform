drop view vw_currency_equiv_display;

create view vw_currency_equiv_display as
SELECT t.code, t.name
FROM currency t
where t.enabled_for_equiv_display = 1;

alter table vw_currency_equiv_display
  owner to cpz;