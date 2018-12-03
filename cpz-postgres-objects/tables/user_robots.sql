create table user_robots
(
  id bigint default nextval('user_robots_id_seq'::regclass) not null
    constraint user_robots_pkey primary key,
  user_id bigint not null
    constraint c_user_robots_userlist_fk references userlist,
  robot_id bigint not null
    constraint c_user_robots_robots_fk   references robots,
  robot_status integer not null
);

create unique index c_user_robots_id on user_robots (id);

