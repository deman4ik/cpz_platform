CREATE TABLE signals_arc
(
    id bigint PRIMARY KEY NOT NULL,
    date_time timestamp,
    robot bigint,
    action varchar(10),
    price numeric,
    params jsonb
);
CREATE UNIQUE INDEX c_signals_arc_pk ON signals (id);
COMMENT ON COLUMN signals.action IS 'Buy | Sell | Short | Cover';
COMMENT ON TABLE signals IS 'Archive of all signals';