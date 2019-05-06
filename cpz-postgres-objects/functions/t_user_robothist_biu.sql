create trigger t_user_robothist_biu
  before insert or update
  on user_robothist
  for each row
execute procedure f_t_user_robothist_biu();