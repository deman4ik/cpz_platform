@functions\f_t_currate_dt.sql
drop view w_user_robot_performance_d;
drop view w_user_robot_performance_h;
drop view w_user_robot_performance_total;
drop view vw_robots;
@views\vw_user_robot_profit_h.sql
@views\vw_user_robot_profit_d.sql
@views\vw_user_robot_performance_d.sql
@views\vw_user_robot_performance_h.sql
@views\vw_user_robot_performance_total.sql
@views\vw_robots.sql

create index i_user_robot_linked_user_robot_fk on user_robot (linked_user_robot_id);
	
drop index i_positions_dates;
create index i_positions_dates on positions (user_id, robot_id, entry_date, exit_date);

create index i_positions_user_robot on positions (user_id, robot_id, run_mode);
create index i_positions_run_mode on positions (run_mode);	
create index i_positions_user_robot_status on positions (user_id, robot_id, status);  	
	
drop function cpz.p_robot_statistics_calc;
@functions\p_robot_statistics_calc.sql