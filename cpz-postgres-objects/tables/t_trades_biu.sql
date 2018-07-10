-- auto-generated definition
create trigger t_trades_biu
  before insert or update
  on trades
  for each row
execute procedure f_t_trades_biu();