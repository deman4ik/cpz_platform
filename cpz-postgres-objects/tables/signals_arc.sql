CREATE TABLE signals_arc
(
    id bigint PRIMARY KEY NOT NULL,
    date_time timestamp,
    robot bigint,
    action varchar(10),
    price numeric,
    params jsonb,
    signal_type varchar(10),
    signal_name varchar(20),
    position bigint
);
CREATE UNIQUE INDEX c_signals_arc_pk ON signals_arc (id);
COMMENT ON COLUMN signals.action IS 'Buy | Sell | Short | Cover';
COMMENT ON TABLE signals_arc IS 'Archive of all signals';