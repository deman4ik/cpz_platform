-- create schema
CREATE SCHEMA "cpz"
    AUTHORIZATION cpz;

-- set current (default) schema
ALTER ROLE cpz IN DATABASE postgres
    SET search_path TO 'cpz';

create sequence cpz_id_seq;
