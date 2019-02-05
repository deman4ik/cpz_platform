create trigger t_positions_bd
  before delete
  on positions
  for each row
execute procedure f_t_positions_bd();