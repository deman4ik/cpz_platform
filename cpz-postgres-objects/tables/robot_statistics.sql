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
  note varchar(100)
);

create unique index c_robot_statistics_pk on robot_statistics (id);
COMMENT ON TABLE robot_statistics IS 'cumulative statistics for every robot (filled by procedure)';