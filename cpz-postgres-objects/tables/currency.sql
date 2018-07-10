-- Table: "cpz-platform".currency

-- DROP TABLE "cpz-platform".currency;

CREATE TABLE "cpz-platform".currency
(
    code character varying(10) COLLATE pg_catalog."default" NOT NULL,
    name character varying(160) COLLATE pg_catalog."default",
    country_name character varying(160) COLLATE pg_catalog."default",
    CONSTRAINT c_currency_pk PRIMARY KEY (code)
        USING INDEX TABLESPACE pg_default,
    CONSTRAINT c_currency_code_uk UNIQUE (code)
        USING INDEX TABLESPACE pg_default
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE "cpz-platform".currency
    OWNER to cpz;