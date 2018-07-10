
create table trade_roundtrips
(
  id bigint default nextval('trade_roundtrips_id_seq'::regclass) not null
    constraint c_trade_roundtrips_pk
    primary key,
  robot       bigserial         not null
    constraint c_trade_roundtrips_robot_fk
    references robots ON UPDATE CASCADE,
  quantity    integer default 1 not null,
  action      varchar(10)       not null,
  entry_date  timestamp         not null,
  entry_price numeric,
  exit_date   timestamp,
  exit_price  numeric,
  bars_held   integer,
  entry_balance numeric,
  exit_balance  numeric,
  "profit$"     numeric,
  historic      integer DEFAULT 0 NOT NULL
);

create unique index c_trade_roundtrips_pk
  on trade_roundtrips (id);
CREATE UNIQUE INDEX c_trade_roundtrips_uk 
  ON trade_roundtrips (robot, action, entry_date, entry_price, exit_date, exit_price);  
create index c_trade_roundtrips_dates
  on trade_roundtrips (robot, entry_date, exit_date);

comment on column trade_roundtrips.action is 'short | long';
comment on column trade_roundtrips.bars_held is '= duration / candle size';
comment on column trade_roundtrips.entry_balance is '= entry_price * quantity';
comment on column trade_roundtrips.exit_balance is '= exit_price * quantity';
COMMENT ON COLUMN trade_roundtrips.historic IS '1 - uploaded historic data, not generated';
comment on table "cpz-platform".trade_roundtrips is E'@omit create,update,delete';