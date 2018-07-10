-- Table: "cpz-platform".exchange_pair

-- DROP TABLE "cpz-platform".exchange_pair;

CREATE TABLE "cpz-platform".exchange_pair
(
    id integer NOT NULL DEFAULT nextval('"cpz-platform".exchange_pair_id_seq'::regclass),
    exchange integer NOT NULL,
    currency character varying(10) COLLATE pg_catalog."default" NOT NULL,
    asset character varying(10) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT c_exchange_pair_pk PRIMARY KEY (id),
    CONSTRAINT c_exchange_pair_uk UNIQUE (exchange, currency, asset),
    CONSTRAINT c_exchange_pair_asset_fk FOREIGN KEY (asset)
        REFERENCES "cpz-platform".assets (code) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT c_exchange_pair_currency_fk FOREIGN KEY (currency)
        REFERENCES "cpz-platform".currency (code) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT c_exchange_pair_exchange_fk FOREIGN KEY (exchange)
        REFERENCES "cpz-platform".exchanges (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE "cpz-platform".exchange_pair
    OWNER to cpz;
COMMENT ON TABLE "cpz-platform".exchange_pair
    IS 'asset-currency pairs supported by exchange';