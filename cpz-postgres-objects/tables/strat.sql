create table strat
(
  id           numeric(17)  not null default nextval('cpz_id_seq'::regclass)
    constraint c_strat_pk
    primary key,
  code         varchar(100) not null
  	constraint c_strat_code_uk
      unique,
  source 			 varchar(10)  not null default 'cpz'::character varying,
  filename		 varchar(240) not null
  	constraint c_strat_filename_uk
      unique,
  descr        varchar(1000),
  dt_start_use timestamp,
  author			 uuid
);

comment on table strat is 'Base strategies';

comment on column strat.source is 'cpz | gekko | user';
comment on column strat.author is 'link to userlist without fk!';



