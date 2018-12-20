import VError from "verror";
import Trader from "cpzTrader/trader";
import { POS_STATUS_OPEN } from "cpzState";

class TraderBacktester extends Trader {
  clearEvents() {
    this._events = [];
  }

  log(...args) {
    if (this._settings.debug) {
      let argsString = "";
      args.forEach(arg => {
        if (typeof arg === "object") {
          argsString = `${argsString}${JSON.stringify(arg)}`;
        } else {
          argsString += arg;
        }
      });
      process.send(`Trader ${this._eventSubject}: ${argsString}`);
    }
  }

  async handlePrice({ price }) {
    try {
      this.log("handlePrice()");
      /* eslint-disable no-restricted-syntax */
      for (const key of Object.keys(this._currentPositions)) {
        /* eslint-disable no-await-in-loop */
        const position = this._currentPositions[key];
        if (position.status === POS_STATUS_OPEN) {
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
        'Error while handling price trader "%s"',
        this._taskId
      );
    }
  }
}

export default TraderBacktester;
