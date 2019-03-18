import VError from "verror";
import Trader from "cpzTrader/trader";
import Log from "cpz/log";
import { POS_STATUS_NEW, POS_STATUS_OPEN } from "cpz/config/state";

class TraderBacktester extends Trader {
  clearEvents() {
    this._events = [];
  }

  log(...args) {
    if (this._settings.debug) {
      Log.debug(`Trader ${this._eventSubject}:`, ...args);
    }
  }

  logInfo(...args) {
    Log.info(`Trader ${this._eventSubject}:`, ...args);
  }

  logError(...args) {
    Log.error(`Trader ${this._eventSubject}:`, ...args);
  }

  // Обработка новой свечи
  async handleCandle(candle) {
    try {
      // По умолчанию берем цену закрытия свечи
      let price = candle.close;
      // Если в последнем сигнале указан источник цены
      const { priceSource } = this._lastSignal;
      if (
        priceSource &&
        ["open", "close", "high", "low"].includes(priceSource)
      ) {
        // берем нужное поле
        price = candle[priceSource];
      }
      this.log(
        "handleCandle()",
        `t: ${candle.timestamp}, o: ${candle.open}, h: ${candle.high}, l: ${
          candle.low
        }, c:${candle.close}`,
        `price: ${price}`
      );
      this.handlePrice({ price, timestamp: candle.timestamp });
      /* eslint-disable no-restricted-syntax */
      for (const key of Object.keys(this._currentPositions)) {
        /* eslint-disable no-await-in-loop */
        const position = this._currentPositions[key];
        if (
          position.status === POS_STATUS_NEW ||
          position.status === POS_STATUS_OPEN
        ) {
          const requiredOrders = position.getRequiredOrders(price);
          if (requiredOrders.length > 0) {
            await this.executeOrders(requiredOrders);
          }
        }
        /* no-await-in-loop */
      }
      /*  no-restricted-syntax */
    } catch (error) {
      throw new VError(
        {
          name: "TraderError",
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            adviserId: this._adviserId,
            userId: this._userId,
            eventSubject: this._eventSubject
          }
        },
        'Error while handling candle trader "%s"',
        this._taskId
      );
    }
  }
}

export default TraderBacktester;
