CREATE USER cpz WITH
	LOGIN
	NOSUPERUSER
	NOCREATEDB
	NOCREATEROLE
	INHERIT
	NOREPLICATION
	CONNECTION LIMIT -1
	PASSWORD 'sys';

grant azure_pg_admin to cpz;

-- connect under cpz
CREATE SCHEMA "cpz-platform"
    AUTHORIZATION cpz;

ALTER ROLE cpz IN DATABASE postgres
    SET search_path TO 'cpz-platform';

CREATE TABLESPACE cpz_platform_data
  OWNER cpz;

ALTER TABLESPACE cpz_platform_data
  OWNER TO cpz;

CREATE TABLESPACE cpz_platform_index
  OWNER cpz;

ALTER TABLESPACE cpz_platform_index
  OWNER TO cpz;
