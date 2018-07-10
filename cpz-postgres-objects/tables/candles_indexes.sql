CREATE INDEX i_candles_exchange_fk
    ON "cpz-platform".candles USING btree
    (exchange)
    TABLESPACE pg_default;

CREATE INDEX i_candles_currency_fk
    ON "cpz-platform".candles USING btree
    (currency COLLATE pg_catalog."default")
    TABLESPACE pg_default;

CREATE INDEX i_candles_asset_fk
    ON "cpz-platform".candles USING btree
    (asset COLLATE pg_catalog."default")
    TABLESPACE pg_default;

CREATE INDEX i_candles_select1
  ON "cpz-platform".candles (exchange, currency, asset)
  TABLESPACE pg_default;