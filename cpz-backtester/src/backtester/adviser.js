import VError from "verror";
import Adviser from "cpzAdviser/adviser";
import Log from "cpzUtils/log";

class AdviserBacktester extends Adviser {
  constructor(context, state) {
    super(context, state);
    this._loadedHistoryCacheBars = state.loadedHistoryCacheBars || 0;
  }

  log(...args) {
    if (this._settings.debug) {
      Log.debug(`Adviser ${this._eventSubject}:`, ...args);
      const logData = args.map(arg => JSON.stringify(arg));
      process.send([`Adviser ${this._eventSubject}:`, ...logData]);
    }
  }

  logInfo(...args) {
    Log.info(`Adviser ${this._eventSubject}:`, ...args);
  }

  logError(...args) {
    Log.error(`Adviser ${this._eventSubject}:`, ...args);
  }

  get indicators() {
    return this._indicators;
  }

  setCachedCandles(candles) {
    this._candles = candles;
    this._lastCandle = this._candles[this._candles.length - 1];
    this._loadedHistoryCacheBars = this._candles.length;
  }

  clearEvents() {
    this._signals = [];
    this._logEvents = [];
  }

  /**
   * Обработка новой свечи
   *
   * @param {*} candle
   * @memberof Adviser
   */
  async handleCandle(candle) {
    try {
      this.log(
        "handleCandle()",
        `t: ${candle.timestamp}, o: ${candle.open}, h: ${candle.high}, l: ${
          candle.low
        }, c:${candle.close}`
      );

      // Обновить текущую свечу
      this._candle = candle;
      // Если  свеча уже обрабатывалась - выходим
      if (this._candle.id === this._lastCandle.id) return;

      // Добавляем новую  свечу
      this._candles.push(this._candle);
      this._candles = this._candles.slice(
        Math.max(
          this._candles.length - this._settings.requiredHistoryMaxBars,
          0
        )
      );
      // Подготовить свечи для индикаторов
      this._prepareCandles();
      // Рассчитать значения индикаторов
      await this.calcIndicators();
      // Считать текущее состояние индикаторов
      this.getIndicatorsState();

      // Запуск стратегии
      this.runStrategy();

      // Сгенерированные сигналы
      this._lastSignals = this._signals;
    } catch (error) {
      throw new VError(
        {
          name: "AdviserError",
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            eventSubject: this._eventSubject,
            strategyName: this._strategyName
          }
        },
        'Failed to handle new candle for strategy "%s"',
        this._strategyName
      );
    }
  }
}

export default AdviserBacktester;
