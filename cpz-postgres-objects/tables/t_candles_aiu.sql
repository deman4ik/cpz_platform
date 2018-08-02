CREATE TRIGGER t_candles_aiu
    AFTER INSERT /*OR UPDATE*/
    ON candles
    FOR EACH ROW
    EXECUTE PROCEDURE f_t_candles_aiu();