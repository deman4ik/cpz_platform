create table robot
(
  id         numeric(17)  not null default nextval('cpz_id_seq'::regclass)
    constraint c_robot_pk
    primary key,
  code       varchar(20)  not null
    constraint c_robot_code_uk
    unique,
  name       varchar(160) not null,
  strat      numeric(17)  not null
    constraint c_robot_strat_fk
    references strat,
  exchange   varchar(30)  not null
    constraint c_robot_exchange_fk
    references exchange,
  currency   varchar(10)  not null
    constraint c_robot_currency_fk
    references currency,
  asset      varchar(10)  not null
    constraint c_robot_asset_fk
    references asset,
  timeframe  integer       not null,
  enabled    integer       not null default 20, 
  descr      text,
  advisersettings  jsonb,
  tradersettings   jsonb,
  candlebatchersettings jsonb  
);

alter table robot
  add constraint c_robot_enabled_chk
    check (enabled in (0,5,10,20));
    
comment on column robot.enabled is '
0 - disabled
5 - admin only
10 - signals
20 - public';

create index i_robot_currency_fk on robot (currency);
create index i_robot_exchange_fk on robot (exchange);
create index i_robot_asset_fk on robot (asset);
create index i_robot_strat_fk on robot (strat);
    
comment on table robot is 'Particular strategy with parameters to work with';

alter table robot owner to cpz;