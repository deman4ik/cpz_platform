-- Table: "cpz-platform".assets

-- DROP TABLE "cpz-platform".assets;

CREATE TABLE "cpz-platform".assets
(
    code character varying(10) COLLATE pg_catalog."default" NOT NULL,
    name character varying(160) COLLATE pg_catalog."default",
    CONSTRAINT c_assets_pk PRIMARY KEY (code),
    CONSTRAINT c_assets_code_uk UNIQUE (code)
        USING INDEX TABLESPACE pg_default
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE "cpz-platform".assets
    OWNER to cpz;