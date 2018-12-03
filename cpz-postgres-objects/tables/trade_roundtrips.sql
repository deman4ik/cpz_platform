
create table trade_roundtrips
(
  id            bigint default nextval('trade_roundtrips_id_seq'::regclass) not null
    constraint c_trade_roundtrips_pk
    primary key,
  robot         bigserial         not null
    constraint c_trade_roundtrips_robot_fk
    references robots ON UPDATE CASCADE,
  quantity      integer default 1 not null,
  action        varchar(10)       not null,
  entry_date    timestamp         not null,
  entry_price   numeric,
  exit_date     timestamp,
  exit_price    numeric,
  bars_held     integer,
  entry_balance numeric,
  exit_balance  numeric,
  "profit$"     numeric,
  historic      integer DEFAULT 0 NOT NULL,
  position      bigint,
  emulator      integer DEFAULT 0 NOT NULL,
  user_id       uuid,
  emulator integer default 0 not null,
  CONSTRAINT c_trade_roundtrips_userlist_fk FOREIGN KEY (user_id) REFERENCES userlist (id) ON DELETE CASCADE
);

create unique index c_trade_roundtrips_pk
  on trade_roundtrips (id);
create unique index c_trade_roundtrips_uk 
  ON trade_roundtrips (robot, action, entry_date, entry_price, exit_date, exit_price, position, user_id);  
create unique index c_trade_roundtrips_uk2 UNIQUE (robot, action, entry_date, entry_price, position, user_id); 
create index c_trade_roundtrips_dates
  on trade_roundtrips (robot, entry_date, exit_date);

comment on column trade_roundtrips.action is 'short | long';
comment on column trade_roundtrips.bars_held is '= duration / candle size';
comment on column trade_roundtrips.entry_balance is '= entry_price * quantity';
comment on column trade_roundtrips.exit_balance is '= exit_price * quantity';
comment on column trade_roundtrips.historic IS '1 - uploaded historic data, not generated';

comment on table trade_roundtrips is E'@omit create,update,delete';

