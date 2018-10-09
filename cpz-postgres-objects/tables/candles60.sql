create sequence candles60_id_seq;

CREATE TABLE candles60
(
    id bigint DEFAULT nextval('candles60_id_seq'::regclass) NOT NULL,
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
    CONSTRAINT c_candle60_currency_fk FOREIGN KEY (currency) REFERENCES currency (code),
    CONSTRAINT c_candle60_assets_fk FOREIGN KEY (asset) REFERENCES assets (code),
    CONSTRAINT c_candle60_exchange_fk FOREIGN KEY (exchange) REFERENCES exchanges (id),
    CONSTRAINT c_candle60_gap check (gap in (0,1))
);
ALTER TABLE candles60 ADD CONSTRAINT c_candles60_pk PRIMARY KEY (id);
--CREATE UNIQUE INDEX c_candles60_pk ON candles60 (id);
CREATE UNIQUE INDEX c_candles60_uk ON candles60 (start, currency, asset, exchange);
CREATE INDEX i_candles60_currency_fk ON candles60 (currency);
CREATE INDEX i_candles60_asset_fk ON candles60 (asset);
CREATE INDEX i_candles60_select1 ON candles60 (exchange, currency, asset);
CREATE INDEX i_candles60_exchange_fk ON candles60 (exchange);