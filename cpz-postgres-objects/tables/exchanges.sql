-- Table: "cpz-platform".exchanges

-- DROP TABLE "cpz-platform".exchanges;

CREATE TABLE "cpz-platform".exchanges
(
    id bigint NOT NULL DEFAULT nextval('"cpz-platform".exchanges_id_seq'::regclass),
    code character varying(40) COLLATE pg_catalog."default" NOT NULL,
    "desc" character varying(2000) COLLATE pg_catalog."default",
    CONSTRAINT c_exchanges_pk PRIMARY KEY (id),
    CONSTRAINT c_exchanges_uk UNIQUE (code)
        USING INDEX TABLESPACE pg_default
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE "cpz-platform".exchanges
    OWNER to cpz;