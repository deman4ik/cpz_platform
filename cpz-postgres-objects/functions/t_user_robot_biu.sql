create trigger t_user_robot_biu
  before insert or update
  on user_robot
  for each row
execute procedure f_t_user_robot_biu();