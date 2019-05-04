import ServiceError from "cpz/error";
import { SIGNALS_NEWSIGNAL_EVENT } from "cpz/events/types/signals";
import { LOG_ADVISER_LOG_EVENT } from "cpz/events/types/log";
import Adviser from "cpzAdviser/state/adviser";
import { loadStrategyCode, loadBaseIndicatorsCode } from "cpzAdviser/executors";

class AdviserBacktester extends Adviser {
  constructor(state) {
    super(state);
    this._loadedHistoryCacheBars = state.loadedHistoryCacheBars || 0;
  }

  get bSignalsEvents() {
    return Object.values(this._eventsToSend)
      .filter(({ eventType }) => eventType === SIGNALS_NEWSIGNAL_EVENT)
      .map(({ eventData: { data } }) => data);
  }

  get bLogEvents() {
    return Object.values(this._eventsToSend)
      .filter(({ eventType }) => eventType === LOG_ADVISER_LOG_EVENT)
      .map(({ eventData: { data } }) => data);
  }

  get bIndicatorsResults() {
    const results = {};
    Object.keys(this._indicators).forEach(key => {
      results[key] = this._indicators[key].result;
    });

    return results;
  }

  async bInit() {
    try {
      const strategyCode = await loadStrategyCode(this.props);
      this.setStrategy(strategyCode);
      this.initStrategy();

      if (this.hasBaseIndicators) {
        const baseIndicatorsCode = await loadBaseIndicatorsCode(
          this.props,
          this.baseIndicatorsFileNames
        );
        this.setBaseIndicatorsCode(baseIndicatorsCode);
      }
      this.setIndicators();
      this.initIndicators();
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.ADVISER_ERROR,
          cause: e,
          info: { ...this.props }
        },
        "Failed to init adviser"
      );
    }
  }

  bSetCachedCandles(candles) {
    this._candles = candles;
    this._lastCandle = this._candles[this._candles.length - 1];
    this._loadedHistoryCacheBars = this._candles.length;
  }

  bClearEvents() {
    this._eventsToSend = {};
  }

  async bExecute(candle) {
    this.handleCandle(candle);

    this._candles = this._candles.slice(
      Math.max(
        this._candles.length -
          (this._settings.requiredHistoryMaxBars > 0
            ? this._settings.requiredHistoryMaxBars
            : 1),
        0
      )
    );
    // Calculation indicators
    await this.calcIndicators();
    // Run strategy
    this.runStrategy();

    this.finalize();
  }
}

export default AdviserBacktester;
