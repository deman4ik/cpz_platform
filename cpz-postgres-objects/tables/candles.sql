CREATE SEQUENCE candles_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

CREATE TABLE candles
(
    id bigint DEFAULT nextval('candles_id_seq'::regclass) PRIMARY KEY NOT NULL,
    start integer NOT NULL,
    timestamp timestamp,
    open double precision NOT NULL,
    high double precision NOT NULL,
    low double precision NOT NULL,
    close double precision NOT NULL,
    volume double precision NOT NULL,
    trades integer,
    vwp double precision,
    currency varchar(10) NOT NULL,
    asset varchar(10) NOT NULL,
    exchange integer NOT NULL,
    CONSTRAINT c_candle_currency_fk FOREIGN KEY (currency) REFERENCES currency (code),
    CONSTRAINT c_candle_assets_fk FOREIGN KEY (asset) REFERENCES assets (code),
    CONSTRAINT c_candle_exchange_fk FOREIGN KEY (exchange) REFERENCES exchanges (id)
);
CREATE UNIQUE INDEX c_candles_pk ON candles (id);
CREATE UNIQUE INDEX c_candles_uk ON candles (start, currency, asset, exchange);
CREATE INDEX i_candles_currency_fk ON candles (currency);
CREATE INDEX i_candles_asset_fk ON candles (asset);
CREATE INDEX i_candles_select1 ON candles (exchange, currency, asset);
CREATE INDEX i_candles_exchange_fk ON candles (exchange);
COMMENT ON COLUMN candles.start IS 'minutes';