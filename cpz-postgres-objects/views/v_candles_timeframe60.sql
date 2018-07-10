CREATE OR REPLACE VIEW v_candles_timeframe60 AS
SELECT
    tt.exchange,
    tt.currency,
    tt.asset,
    tt.grp AS start,
    max(tt.start) AS end,
    min(tt."timestamp") AS time_start,
    max(tt."timestamp") AS time_end,
    tt.open,
    tt.high,
    tt.low,
    tt.close,
    tt.volume
   FROM ( SELECT
            t.exchange,
            t.currency,
            t.asset,
            t.start,
            t."timestamp",
            t.open AS open_src,
            t.high AS high_src,
            t.low AS low_src,
            t.close AS close_src,
            t.rownum,
            ((t.rownum + 60 - 2) % (60)::bigint) AS test,
            (t.start - (((t.rownum + 60 - 2) % (60)::bigint) * 60)) AS grp,
            first_value(t.open) OVER w AS open,
            last_value(t.close) OVER w AS close,
            max(t.high) OVER w AS high,
            min(t.low) OVER w AS low,
            sum(t.volume) OVER w AS volume
           FROM ( SELECT
                    candles.exchange,
                    candles.currency,
                    candles.asset,
                    candles.start,
                    candles."timestamp",
                    candles.open,
                    candles.high,
                    candles.low,
                    candles.close,
                    candles.volume,
                    row_number() OVER (PARTITION BY exchange, asset, currency ORDER BY candles.start) AS rownum
                   FROM candles
                    WHERE
                      "timestamp" >= '2018-01-01 00:00:00.000000' /*some 00:00 *MUST* be set as start point! */
                ) t
          WINDOW w AS (
            PARTITION BY ( t.exchange, t.currency, t.asset, t.start - (((t.rownum + 60 - 2) % (60)::bigint) * 60) )
            ORDER BY t.start ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
          )
        ) tt

  GROUP BY tt.exchange, tt.currency, tt.asset, tt.grp, tt.open, tt.close, tt.high, tt.low, tt.volume
  ORDER BY tt.exchange, tt.currency, tt.asset, tt.grp;