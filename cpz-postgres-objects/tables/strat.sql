-- auto-generated definition
CREATE TABLE strat
(
  id           bigserial    NOT NULL
    CONSTRAINT c_strat_pk
    PRIMARY KEY,
  code         varchar(100) NOT NULL,
  descr        varchar(1000),
  dt_start_use timestamp,
  source varchar(10) DEFAULT 'cpz'::character varying
);

CREATE UNIQUE INDEX c_strat_code_uk
  ON strat (code);

COMMENT ON TABLE strat
IS 'base strategies';

COMMENT ON COLUMN "cpz-platform".strat.source IS 'cpz | gekko | external';



