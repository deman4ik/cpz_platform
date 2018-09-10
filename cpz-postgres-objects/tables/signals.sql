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
    position bigint DEFAULT nextval('signals_position_seq'::regclass) NOT NULL,
    CONSTRAINT c_signals_robot_fk FOREIGN KEY (robot) REFERENCES robots (id)
);
CREATE UNIQUE INDEX c_signals_pk ON signals (id);
CREATE UNIQUE INDEX c_signals_uk ON signals (robot, date_time, action, price, signal_type, position);
CREATE UNIQUE INDEX c_signals_position_uk ON signals (position);
COMMENT ON COLUMN signals.action IS 'Buy | Sell | Short | Cover';
COMMENT ON TABLE signals IS 'Current active signals';