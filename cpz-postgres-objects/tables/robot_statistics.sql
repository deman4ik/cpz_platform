-- auto-generated definition
create table robot_statistics
(
  id           bigint DEFAULT nextval('robot_statistics_id_seq'::regclass) NOT NULL
    constraint c_robot_statistics_pk
    primary key,
  stat_name    varchar(240),
  robot        bigint not null
    constraint c_robot_statistics_robot_fk
    references robots ON UPDATE CASCADE,
  all_trades   numeric,
  long_trades  numeric,
  short_trades numeric,
  sort_order   integer DEFAULT 1 NOT NULL,
  note varchar(100),
  user_robot_id bigint,
  CONSTRAINT c_robot_statistics_userrobot_fk FOREIGN KEY (user_robot_id) REFERENCES user_robots (id)   
);

create unique index c_robot_statistics_pk on robot_statistics (id);
COMMENT ON TABLE robot_statistics IS 'cumulative statistics for every robot (filled by procedure)';
comment on table "cpz-platform".robot_statistics is E'@omit create,update,delete';