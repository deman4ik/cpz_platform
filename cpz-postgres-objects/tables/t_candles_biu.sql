CREATE TRIGGER t_candles_biu
    BEFORE INSERT OR UPDATE 
    ON "cpz-platform".candles
    FOR EACH ROW
    EXECUTE PROCEDURE "cpz-platform".f_t_candles_biu();