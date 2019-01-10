import "babel-polyfill";
import VError from "verror";
import io from "socket.io-client";
import { v4 as uuid } from "uuid";
import { MARKETWATCHER_SERVICE } from "cpzServices";
import { ERROR_MARKETWATCHER_EVENT, ERROR_TOPIC } from "cpzEventTypes";
import { createErrorOutput } from "cpzUtils/error";
import { capitalize } from "cpzUtils/helpers";
import publishEvents from "cpzEvents";
import {
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_ERROR,
  createCachedTickSlug
} from "cpzState";
import BaseProvider from "./baseProvider";

let providerInstance;

class CryptocompareProvider extends BaseProvider {
  constructor(state) {
    super(state);
    // Создаем новое подключение к провайдеру Cryptocompare
    this._socket = io("https://streamer.cryptocompare.com/");
    this._subscribeToSocketEvents();
  }

  _getDirection(dir) {
    switch (dir) {
      case "1":
        return "up";
      case "2":
        return "down";
      case "4":
        return "unchanged";
      default:
        return "unknown";
    }
  }

  _currentToObject(value) {
    const valuesArray = value.split("~");

    const type = valuesArray[0];
    if (type === "2") {
      // {Type}~{ExchangeName}~{FromCurrency}~{ToCurrency}~{Flag}~{Price}~{LastUpdate}~{LastVolume}~{LastVolumeTo}~{LastTradeId}~{Volume24h}~{Volume24hTo}~{MaskInt}

      const mask = valuesArray[valuesArray.length - 1].toString().slice(-1);
      if (mask === "9") {
        const tickId = uuid();
        const obj = {
          type: "tick",
          tickId,
          PartitionKey: createCachedTickSlug({
            exchange: this._exchange,
            asset: valuesArray[2],
            currency: valuesArray[3]
          }),
          RowKey: tickId,
          exchange: this._exchange,
          asset: valuesArray[2],
          currency: valuesArray[3],
          direction: this._getDirection(valuesArray[4]),
          price: parseFloat(valuesArray[5]),
          time: parseInt(valuesArray[6], 10) * 1000,
          timestamp: new Date(
            parseInt(valuesArray[6], 10) * 1000
          ).toISOString(),
          volume: parseFloat(valuesArray[8]),
          tradeId: valuesArray[9]
        };
        return obj;
      }
    }
    if (type === "0") {
      // {SubscriptionId}~{ExchangeName}~{CurrencySymbol}~{CurrencySymbol}~{Flag}~{TradeId}~{TimeStamp}~{Quantity}~{Price}~{Total}
      const tickId = uuid();
      const obj = {
        type: "trade",
        tickId,
        PartitionKey: createCachedTickSlug({
          exchange: this._exchange,
          asset: valuesArray[2],
          currency: valuesArray[3]
        }),
        RowKey: tickId,
        exchange: this._exchange,
        asset: valuesArray[2],
        currency: valuesArray[3],
        direction: this._getDirection(valuesArray[4]),
        tradeId: valuesArray[5],
        time: parseInt(valuesArray[6], 10) * 1000,
        timestamp: new Date(parseInt(valuesArray[6], 10) * 1000).toISOString(),
        volume: parseFloat(valuesArray[7]),
        price: parseFloat(valuesArray[8])
      };
      return obj;
    }
    return null;
  }

  _subscribeToSocketEvents() {
    this._socket.on("connect", async () => {
      this.log("connect");
      this._socketStatus = "connect";
      await this._save();
    });
    // При получении нового сообщения
    this._socket.on("m", async message => {
      const currentPrice = this._currentToObject(message);
      if (currentPrice) {
        this.log(
          `${currentPrice.asset}/${currentPrice.currency} ${
            currentPrice.type
          } ${currentPrice.price}`
        );
        if (currentPrice.type === "tick") await this._publishTick(currentPrice);
        if (currentPrice.type === "trade") await this._saveTrade(currentPrice);
      }
    });

    // При disconnectе
    this._socket.on("disconnect", async reason => {
      this.log("disconnect", reason);
      this._socketStatus = reason;
      //  if (reason === "io server disconnect") {
      // the disconnection was initiated by the server, you need to reconnect manually
      this._socket.connect();
      // }
      await this._save();
      // else the socket will automatically try to reconnect
    });

    // Если произошла ошибка
    this._socket.on("error", async error => {
      this.log("error", error);
      this._socketStatus = "error";
      this._status = STATUS_ERROR;
      const errorOutput = createErrorOutput(
        new VError(
          {
            name: "CryptocompareStreamingError",
            cause: new Error(error),
            info: this._getCurrentState()
          },
          'Cryptocompare streaming error - task "%s"',
          this._taskId
        )
      );
      this.logError(errorOutput);
      this._error = {
        name: errorOutput.name,
        message: errorOutput.message,
        info: errorOutput.info
      };
      await publishEvents(ERROR_TOPIC, {
        service: MARKETWATCHER_SERVICE,
        subject: this._eventSubject,
        eventType: ERROR_MARKETWATCHER_EVENT,
        data: {
          taskId: this._taskId,
          error: {
            name: errorOutput.name,
            message: errorOutput.message,
            info: errorOutput.info
          }
        }
      });
      await this._save();
      process.exit(0);
    });

    // Если все попытки переподключения исчерпаны
    this._socket.on("reconnect_failed", async () => {
      this.log("reconnect_failed");
      this._socketStatus = "reconnect_failed";
      this._status = STATUS_ERROR;
      const errorOutput = createErrorOutput(
        new VError(
          {
            name: "CryptocompareStreamingError",
            info: this._getCurrentState()
          },
          'Cryptocompare streaming error - Reconnect failed - task "%s"',
          this._taskId
        )
      );
      this.logError(errorOutput);
      this._error = {
        name: errorOutput.name,
        message: errorOutput.message,
        info: errorOutput.info
      };
      await publishEvents(ERROR_TOPIC, {
        service: MARKETWATCHER_SERVICE,
        subject: this._eventSubject,
        eventType: ERROR_MARKETWATCHER_EVENT,
        data: {
          taskId: this._taskId,
          error: {
            name: errorOutput.name,
            message: errorOutput.message,
            info: errorOutput.info
          }
        }
      });
      await this._save();
      process.exit(0);
    });
  }

  async start() {
    try {
      const activeTradeSubs = this._subscriptions.map(
        sub => `0~${capitalize(this._exchange)}~${sub.asset}~${sub.currency}`
      );
      const activeTickSubs = this._subscriptions.map(
        sub => `2~${capitalize(this._exchange)}~${sub.asset}~${sub.currency}`
      );
      // Если сокет не подключен
      if (this._socketStatus !== "connect") {
        // Ждем секунду
        setTimeout(() => {
          // И проверяем повторно
          if (this._socketStatus !== "connect") {
            // Если все еще не подключен - генерируем ошибку
            throw new VError(
              {
                name: "CryptocompareStreamingError",
                info: this._getCurrentState()
              },
              'Can\'t open connection to Cryptocompare - task "%s"',
              this._taskId
            );
          }
        }, 1000);
      }

      this._socket.emit("SubAdd", {
        subs: [...activeTradeSubs, ...activeTickSubs]
      });
      this._status = STATUS_STARTED;
      await this._save();
      this.log(`Marketwatcher ${this._exchange} started!`);
    } catch (error) {
      const errorOutput = createErrorOutput(
        new VError(
          {
            name: "CryptocompareStreamingError",
            cause: error,
            info: this._getCurrentState()
          },
          'Cryptocompare start streaming error - task "%s"',
          this._taskId
        )
      );
      this.logError(errorOutput);
      this._status = STATUS_ERROR;
      this._error = {
        name: errorOutput.name,
        message: errorOutput.message,
        info: errorOutput.info
      };
      await publishEvents(ERROR_TOPIC, {
        service: MARKETWATCHER_SERVICE,
        subject: this._eventSubject,
        eventType: ERROR_MARKETWATCHER_EVENT,
        data: {
          taskId: this._taskId,
          error: {
            name: errorOutput.name,
            message: errorOutput.message,
            info: errorOutput.info
          }
        }
      });
      await this._save();
      process.exit(0);
    }
  }

  async stop() {
    this._socket.close();
    this._status = STATUS_STOPPED;
    await this._save();
    process.exit(0);
  }

  async subscribe(subscriptions) {
    try {
      this._subscriptions = [...this._subscriptions, ...subscriptions];
      const newTradeSubs = subscriptions.map(
        sub => `0~${capitalize(this._exchange)}~${sub.asset}~${sub.currency}`
      );
      const newTickSubs = subscriptions.map(
        sub => `2~${capitalize(this._exchange)}~${sub.asset}~${sub.currency}`
      );
      this._socket.emit("SubAdd", {
        subs: [...newTradeSubs, ...newTickSubs]
      });
      await this._save();
    } catch (error) {
      const errorOutput = createErrorOutput(
        new VError(
          {
            name: "CryptocompareStreamingError",
            cause: error,
            info: this._getCurrentState()
          },
          'Cryptocompare subscribe streaming error - task "%s"',
          this._taskId
        )
      );
      this.logError(errorOutput);
      this._error = {
        name: errorOutput.name,
        message: errorOutput.message,
        info: errorOutput.info
      };
      await publishEvents(ERROR_TOPIC, {
        service: MARKETWATCHER_SERVICE,
        subject: this._eventSubject,
        eventType: ERROR_MARKETWATCHER_EVENT,
        data: {
          taskId: this._taskId,
          error: {
            name: errorOutput.name,
            message: errorOutput.message,
            info: errorOutput.info
          }
        }
      });
      await this._save();
    }
  }

  async unsubscribe(subscriptions) {
    try {
      this._subscriptions = this._subscriptions.filter(
        sub =>
          !subscriptions.find(
            del => del.asset === sub.asset && del.currency === sub.currency
          )
      );

      const delTradeSubs = subscriptions.map(
        sub => `0~${capitalize(this._exchange)}~${sub.asset}~${sub.currency}`
      );
      const delTickSubs = subscriptions.map(
        sub => `2~${capitalize(this._exchange)}~${sub.asset}~${sub.currency}`
      );
      this._socket.emit("SubRemove", {
        subs: [...delTradeSubs, ...delTickSubs]
      });
      await this._save();
    } catch (error) {
      const errorOutput = createErrorOutput(
        new VError(
          {
            name: "CryptocompareStreamingError",
            cause: error,
            info: this._getCurrentState()
          },
          'Cryptocompare unsubscribe streaming error - task "%s"',
          this._taskId
        )
      );
      this.logError(errorOutput);
      this._error = {
        name: errorOutput.name,
        message: errorOutput.message,
        info: errorOutput.info
      };
      await publishEvents(ERROR_TOPIC, {
        service: MARKETWATCHER_SERVICE,
        subject: this._eventSubject,
        eventType: ERROR_MARKETWATCHER_EVENT,
        data: {
          taskId: this._taskId,
          error: {
            name: errorOutput.name,
            message: errorOutput.message,
            info: errorOutput.info
          }
        }
      });
      await this._save();
    }
  }
}

process.on("message", async m => {
  const eventData = JSON.parse(m);
  switch (eventData.type) {
    case "start":
      providerInstance = new CryptocompareProvider(eventData.state);
      await providerInstance.start(eventData.state.subscriptions);
      break;
    case "stop":
      await providerInstance.stop();
      break;
    case "subscribe":
      await providerInstance.subscribe(eventData.subscriptions);
      break;
    case "unsubscribe":
      await providerInstance.unsubscribe(eventData.subscriptions);
      break;
    default:
      process.send(["Unknown child process event type"]);
      break;
  }
});
