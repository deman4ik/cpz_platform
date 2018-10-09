
create sequence candles30_id_seq;

CREATE TABLE candles30
(
    id bigint DEFAULT nextval('candles30_id_seq'::regclass) NOT NULL,
    time_start timestamp NOT NULL,
    time_end timestamp NOT NULL,
    start integer NOT NULL,
    "end" integer NOT NULL,
    open numeric NOT NULL,
    high numeric NOT NULL,
    low numeric NOT NULL,
    close numeric NOT NULL,
    volume numeric NOT NULL,
    trades integer,
    vwp numeric,
    currency varchar(10) NOT NULL,
    asset varchar(10) NOT NULL,
    exchange integer NOT NULL,
    gap integer NOT NULL,
    "timestamp" timestamp,
    CONSTRAINT c_candle5_currency_fk FOREIGN KEY (currency) REFERENCES currency (code),
    CONSTRAINT c_candle5_assets_fk FOREIGN KEY (asset) REFERENCES assets (code),
    CONSTRAINT c_candle5_exchange_fk FOREIGN KEY (exchange) REFERENCES exchanges (id),
    CONSTRAINT c_candle5_gap check (gap in (0,1))
);
ALTER TABLE candles30 ADD CONSTRAINT c_candles30_pk PRIMARY KEY (id);
--CREATE UNIQUE INDEX c_candles30_pk ON candles30 (id);
CREATE UNIQUE INDEX c_candles30_uk ON candles30 (start, currency, asset, exchange);
CREATE INDEX i_candles30_currency_fk ON candles30 (currency);
CREATE INDEX i_candles30_asset_fk ON candles30 (asset);
CREATE INDEX i_candles30_select1 ON candles30 (exchange, currency, asset);
CREATE INDEX i_candles30_exchange_fk ON candles30 (exchange);
