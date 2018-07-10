-- auto-generated definition
create table robots
(
  id         bigserial   not null
    constraint c_robots_pk
    primary key,
  code       varchar(20) not null,
  name       varchar(30) not null,
  descr      varchar(1000),
  strat      bigint      not null
    constraint c_robots_strat_fk
    references strat on update cascade,
  exchange   bigint      not null
    constraint c_robots_exchange_fk
    references exchanges on update cascade,
  currency   varchar(10) not null
    constraint c_robots_currency_fk
    references currency on update cascade,
  asset      varchar(10) not null
    constraint c_robots_asset_fk
    references assets on update cascade,
  candlesize integer     not null
);

comment on table robots
is 'particular strat with parameters to work with';

create unique index c_robots_code_uk
  on robots (code);

