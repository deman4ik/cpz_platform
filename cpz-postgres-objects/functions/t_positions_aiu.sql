create trigger t_positions_aiu
  after insert or update
  on positions
  for each row
execute procedure f_t_positions_aiu();