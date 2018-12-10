create trigger t_positions_biu
  before insert or update
  on positions
  for each row
execute procedure f_t_positions_biu();