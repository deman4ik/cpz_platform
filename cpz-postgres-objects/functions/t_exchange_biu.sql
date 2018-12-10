create trigger t_exchange_biu
  before insert or update
  on exchange
  for each row
execute procedure f_t_exchange_biu();