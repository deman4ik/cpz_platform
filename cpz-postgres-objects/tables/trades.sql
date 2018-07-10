-- auto-generated definition
create table trades
(
  id        bigint default nextval('trades_id_seq' :: regclass) not null
    constraint c_trades_pk
    primary key,
  date      integer                                             not null,
  timestamp timestamp,
  action    varchar(10)                                         not null,
  price     double precision                                    not null,
  robot     bigint                                              not null
    constraint c_trades_robot_fk
    references robots ON UPDATE CASCADE
);

comment on table "cpz-platform".trades is E'@omit create,update,delete';
comment on column trades.date
is 'Время типа интервал';

CREATE UNIQUE INDEX c_trades_date_action_uk ON trades (robot, date, action);