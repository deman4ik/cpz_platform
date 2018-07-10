-- Table: "cpz-platform".candles

-- DROP TABLE "cpz-platform".candles;

CREATE TABLE "cpz-platform".candles
(
    id bigint NOT NULL DEFAULT nextval('"cpz-platform".candles_id_seq'::regclass),
    start integer NOT NULL,
    "timestamp" timestamp without time zone,
    open double precision NOT NULL,
    high double precision NOT NULL,
    low double precision NOT NULL,
    close double precision NOT NULL,
    volume double precision NOT NULL,
    trades integer,
    vwp double precision,
    currency character varying(10) COLLATE pg_catalog."default" NOT NULL,
    asset character varying(10) COLLATE pg_catalog."default" NOT NULL,
    exchange integer NOT NULL,
    CONSTRAINT c_candles_pk PRIMARY KEY (id),
    CONSTRAINT c_candles_uk UNIQUE (start, currency, asset, exchange),
    CONSTRAINT c_candle_assets_fk FOREIGN KEY (asset)
        REFERENCES "cpz-platform".assets (code) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT c_candle_currency_fk FOREIGN KEY (currency)
        REFERENCES "cpz-platform".currency (code) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT c_candle_exchange_fk FOREIGN KEY (exchange)
        REFERENCES "cpz-platform".exchanges (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

comment on table "cpz-platform".candles is E'@omit create,update,delete';

ALTER TABLE "cpz-platform".candles
    OWNER to cpz;

COMMENT ON COLUMN "cpz-platform".candles.start
    IS 'Время типа интервал';

-- Index: i_candles_asset_fk

-- DROP INDEX "cpz-platform".i_candles_asset_fk;

CREATE INDEX i_candles_asset_fk
    ON "cpz-platform".candles USING btree
    (asset COLLATE pg_catalog."default")
    TABLESPACE pg_default;

-- Index: i_candles_currency_fk

-- DROP INDEX "cpz-platform".i_candles_currency_fk;

CREATE INDEX i_candles_currency_fk
    ON "cpz-platform".candles USING btree
    (currency COLLATE pg_catalog."default")
    TABLESPACE pg_default;

-- Index: i_candles_exchange_fk

-- DROP INDEX "cpz-platform".i_candles_exchange_fk;

CREATE INDEX i_candles_exchange_fk
    ON "cpz-platform".candles USING btree
    (exchange)
    TABLESPACE pg_default;