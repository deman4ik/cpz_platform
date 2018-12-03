CREATE TABLE trades
(
    id bigint DEFAULT nextval('trades_id_seq'::regclass) NOT NULL,
    order_time timestamp,
    action varchar(10) NOT NULL,
    price numeric NOT NULL,
    robot bigint NOT NULL,
    ordertype varchar(10),
    order_num integer,
    --position bigint,
    user_id uuid,
    quantity numeric,
    roundtrip_id numeric NOT NULL,
    CONSTRAINT c_trades_robot_fk FOREIGN KEY (robot) REFERENCES robots (id) ON UPDATE CASCADE,
    CONSTRAINT c_trades_roundtrip_fk FOREIGN KEY (roundtrip_id) REFERENCES trade_roundtrips (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT c_trades_userlist_fk FOREIGN KEY (user_id) REFERENCES userlist (id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX c_trades_pk ON trades (id);
CREATE UNIQUE INDEX c_trades_date_action_uk ON trades (robot, order_time, action, position, user_id);
COMMENT ON COLUMN trades.order_time IS 'Время ордера';
COMMENT ON COLUMN trades.quantity IS 'Объем ордера';
comment on table trades is E'@omit create,update,delete';