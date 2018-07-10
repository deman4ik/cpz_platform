-- auto-generated definition
create trigger t_trade_roundtrips_biu
  before insert or update
  on trade_roundtrips
  for each row
execute procedure f_t_trade_roundtrips_biu();

