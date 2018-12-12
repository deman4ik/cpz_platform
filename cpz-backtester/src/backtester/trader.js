import VError from "verror";
import Trader from "cpzTrader/trader";
import { POS_STATUS_OPENED } from "cpzState";

class TraderBacktester extends Trader {
  clearEvents() {
    this._signals = [];
    this._logEvents = [];
  }

  log(...args) {
    if (this._settings.debug) {
      process.send(`Trader ${this.eventSubject}: ${args.join(" ")}`);
    }
  }

  async handlePrice(currentPrice) {
    try {
      this.log("handlePrice()");
      /* eslint-disable no-restricted-syntax */
      for (const key of Object.keys(this._currentPositions)) {
        /* eslint-disable no-await-in-loop */
        const position = this._currentPositions[key];
        if (position.status === POS_STATUS_OPENED) {
          const requiredOrders = position.getRequiredOrders(currentPrice.price);
          this.log(requiredOrders);
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
        'Error while handling price trader "%s"',
        this._taskId
      );
    }
  }
}

export default TraderBacktester;
