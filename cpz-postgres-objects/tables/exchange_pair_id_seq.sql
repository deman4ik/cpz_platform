CREATE SEQUENCE "cpz-platform".exchange_pair_id_seq
    INCREMENT 1
    START 4
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE "cpz-platform".exchange_pair_id_seq
    OWNER TO cpz;