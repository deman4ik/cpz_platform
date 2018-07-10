-- auto-generated definition
create trigger t_tmp_trades_load_bi
  before insert
  on tmp_trades_load
  for each row
execute procedure f_t_tmp_trades_load_bi();

