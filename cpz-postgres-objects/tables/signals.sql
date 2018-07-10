CREATE TABLE signals
(
    id bigint DEFAULT nextval('signals_id_seq'::regclass) PRIMARY KEY NOT NULL,
    date_time timestamp,
    robot bigint,
    action varchar(10),
    price numeric,
    params jsonb,
    signal_type varchar(10),
    signal_name varchar(20),
    CONSTRAINT c_signals_robot_fk FOREIGN KEY (robot) REFERENCES robots (id)
);
CREATE UNIQUE INDEX c_signals_pk ON signals (id);
COMMENT ON COLUMN signals.action IS 'Buy | Sell | Short | Cover';
comment on table "cpz-platform".signals is E'@omit create,update,delete';