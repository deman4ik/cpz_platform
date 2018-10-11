import VError from "verror";
import Adviser from "../adviser/adviser";
import { saveBacktesterState, saveBacktesterItem } from "../tableStorage";

class Backtester extends Adviser {
  constructor(context, state) {
    super(context, state);

    this._dateFrom = state.dateFrom;
    this._dateTo = state.dateTo;
    this._loadedHistoryCacheBars = state.loadedHistoryCacheBars || 0;
    this._totalBars = state.totalCount || 0;
    this._processedBars = state.processedBars || 0;
    this._leftBars = state.leftBars || 0;
    this._percent = state.percent || 0;
  }

  setCachedCandles(candles) {
    this._candles = candles;
    this._lastCandle = this._candles[this._candles.length - 1];
    this._loadedHistoryCacheBars = this._candles.length;
  }

  setTotalBars(totalBars) {
    this._totalBars = totalBars;
  }

  /**
   * Обработка новой свечи
   *
   * @param {*} candle
   * @memberof Adviser
   */
  async handleCandle(candle) {
    try {
      this.log("handleCandle()");

      // Обновить текущую свечу
      this._candle = candle;
      // Если  свеча уже обрабатывалась - выходим
      if (this._candle.id === this._lastCandle.id) return;
      // Удаляем первую свечу
      this._candles.shift();
      // Добавляем новую  свечу
      this._candles.push(this._candle);

      // Подготовить свечи для индикаторов
      this._prepareCandles();
      // Рассчитать значения индикаторов
      await this.calcIndicators();
      // Считать текущее состояние индикаторов
      this.getIndicatorsState();

      // Запуск стратегии
      this.runStrategy();
      // Обработанная свеча
      this._lastCandle = this._candle;
      this._processedBars += 1;
      this._leftBars = this._totalBars - this._processedBars;
      this._percent = Math.round((this._processedBars / this._totalBars) * 100);
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

  /**
   * Запрос всего текущего состояния
   *
   * @returns {object}
   * @memberof Backtester
   */
  getCurrentState() {
    this.getIndicatorsState();
    this.getStrategyState();
    return {
      eventSubject: this._eventSubject,
      taskId: this._taskId,
      robotId: this._robotId,
      debug: this._debug,
      settings: this._settings,
      exchange: this._exchange,
      exchangeId: this._exchangeId,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      lastCandle: this._lastCandle,
      lastSignals: this._lastSignals,
      strategyName: this._strategyName,
      strategy: this._strategy,
      indicators: this._indicators,
      status: this._status,
      startedAt: this._startedAt,
      endedAt: this._endedAt,
      initialized: this._initialized,
      metadata: this._metadata,
      dateFrom: this._dateFrom,
      dateTo: this._dateTo,
      loadedHistoryCacheBars: this._loadedHistoryCacheBars,
      totalBars: this._totalBars,
      processedBars: this._processedBars,
      leftBars: this._leftBars,
      percent: this._percent
    };
  }

  /**
   * Сохранение всего текущего состояния в локальное хранилище
   *
   * @memberof Backtester
   */
  async save() {
    this.log(`save()`);
    try {
      // Сохраняем состояние в локальном хранилище
      await saveBacktesterState(this.getCurrentState());
    } catch (error) {
      throw new VError(
        {
          name: "BacktesterError",
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            eventSubject: this._eventSubject,
            strategyName: this._strategyName
          }
        },
        'Failed to update backtester "%s" state',
        this._taskId
      );
    }
  }

  /**
   * Сохранение итерации работы бэктестера
   *
   * @memberof Backtester
   */
  async saveItem() {
    this.log(`save()`);
    try {
      const item = {
        taskId: this._taskId,
        candle: this._candle,
        signals: this._signals,
        strategy: this._strategy,
        indicators: this._indicators
      };
      // Сохраняем состояние в локальном хранилище
      await saveBacktesterItem(item);
    } catch (error) {
      throw new VError(
        {
          name: "BacktesterError",
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            eventSubject: this._eventSubject,
            strategyName: this._strategyName
          }
        },
        'Failed to update backtester "%s" state',
        this._taskId
      );
    }
  }
}

export default Backtester;
