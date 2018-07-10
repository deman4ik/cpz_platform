-- auto-generated definition
create trigger t_tmp_signal_load_bd
  before delete
  on tmp_signal_load
  for each row
execute procedure f_t_tmp_signal_load_bd();

