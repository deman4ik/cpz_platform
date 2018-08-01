
create sequence candles5_id_seq;

CREATE TABLE candles5
(
    id bigint DEFAULT nextval('candles5_id_seq'::regclass) NOT NULL,
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
    CONSTRAINT c_candle5_currency_fk FOREIGN KEY (currency) REFERENCES currency (code),
    CONSTRAINT c_candle5_assets_fk FOREIGN KEY (asset) REFERENCES assets (code),
    CONSTRAINT c_candle5_exchange_fk FOREIGN KEY (exchange) REFERENCES exchanges (id),
    CONSTRAINT c_candle5_gap check (gap in (0,1))
);
ALTER TABLE candles5 ADD CONSTRAINT c_candles5_pk PRIMARY KEY (id);
--CREATE UNIQUE INDEX c_candles5_pk ON candles5 (id);
CREATE UNIQUE INDEX c_candles5_uk ON candles5 (start, currency, asset, exchange);
CREATE INDEX i_candles5_currency_fk ON candles5 (currency);
CREATE INDEX i_candles5_asset_fk ON candles5 (asset);
CREATE INDEX i_candles5_select1 ON candles5 (exchange, currency, asset);
CREATE INDEX i_candles5_exchange_fk ON candles5 (exchange);
