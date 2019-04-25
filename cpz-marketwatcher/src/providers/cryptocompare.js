import ServiceError from "cpz/error";
import io from "socket.io-client";
import { v4 as uuid } from "uuid";
import { capitalize } from "cpz/utils/helpers";
import EventGrid from "cpz/events";
import { ERROR_MARKETWATCHER_ERROR_EVENT } from "cpz/events/types/error";
import Log from "cpz/log";
import {
  createCachedTickSlug,
  STATUS_ERROR,
  STATUS_STARTED,
  STATUS_STOPPED
} from "cpz/config/state";
import BaseProvider from "./baseProvider";
import init from "../init";

init();
let providerInstance;

class CryptocompareProvider extends BaseProvider {
  constructor(state) {
    super(state);
    // Создаем новое подключение к провайдеру Cryptocompare
    this._socket = io("https://streamer.cryptocompare.com/", {
      transports: ["websocket"]
    });
    this._subscribeToSocketEvents();
  }

  get connected() {
    return this._socket.connected;
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
        return {
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
      }
    }
    if (type === "0") {
      // {SubscriptionId}~{ExchangeName}~{CurrencySymbol}~{CurrencySymbol}~{Flag}~{TradeId}~{TimeStamp}~{Quantity}~{Price}~{Total}
      const tickId = uuid();
      return {
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
    }
    return null;
  }

  async _handleError(e = "unknown connection error") {
    if (this._status !== STATUS_STOPPED) {
      this._socketStatus = "error";
      this._status = STATUS_ERROR;

      const error = new ServiceError(
        {
          name: ServiceError.types.MARKETWATCHER_SOCKET_ERROR,
          cause: new Error(e),
          info: { ...this.props }
        },
        "Cryptocompare streaming error"
      );
      Log.error(error);

      this._error = error.json;
      EventGrid.publish(ERROR_MARKETWATCHER_ERROR_EVENT, {
        subject: this._exchange,
        data: {
          taskId: this._taskId,
          error: error.json
        }
      });

      await this._save();
      process.exit(0);
    }
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
        await this._saveTrade(currentPrice);
        if (currentPrice.type === "tick") await this._publishTick(currentPrice);
      }
    });

    // При disconnectе
    this._socket.on("disconnect", this._handleError.bind(this));

    // Если произошла ошибка
    this._socket.on("error", this._handleError.bind(this));

    this._socket.on("reconnect_attempt", () => {
      this._socket.io.opts.transports = ["polling", "websocket"];
    });

    // Если все попытки переподключения исчерпаны
    this._socket.on("reconnect_failed", this._handleError.bind(this));
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
            throw new Error(
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
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.MARKETWATCHER_SOCKET_ERROR,
          cause: e,
          info: { ...this.props }
        },
        'Cryptocompare start streaming error - task "%s"',
        this._taskId
      );

      Log.error(error);
      this._status = STATUS_ERROR;
      this._error = error.json;
      EventGrid.publish(ERROR_MARKETWATCHER_ERROR_EVENT, {
        subject: this._exchange,
        data: {
          taskId: this._taskId,
          error: error.json
        }
      });
      await this._save();
      process.exit(0);
    }
  }

  async stop() {
    this._status = STATUS_STOPPED;
    await this._save();
    this._socket.close();
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
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.MARKETWATCHER_SOCKET_ERROR,
          cause: e,
          info: { ...this.props }
        },
        'Cryptocompare subscribe streaming error - task "%s"',
        this._taskId
      );

      Log.error(error);
      this._error = error.json;
      EventGrid.publish(ERROR_MARKETWATCHER_ERROR_EVENT, {
        subject: this._exchange,
        data: {
          taskId: this._taskId,
          error: error.json
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
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.MARKETWATCHER_SOCKET_ERROR,
          cause: e,
          info: { ...this.props }
        },
        'Cryptocompare unsubscribe streaming error - task "%s"',
        this._taskId
      );

      Log.error(error);
      this._error = error.json;
      EventGrid.publish(ERROR_MARKETWATCHER_ERROR_EVENT, {
        subject: this._exchange,
        data: {
          taskId: this._taskId,
          error: error.json
        }
      });
      await this._save();
    }
  }
}

process.on("message", async m => {
  const eventData = JSON.parse(m);
  switch (eventData.type) {
    case "check":
      if (providerInstance && providerInstance.socketStatus === "connect") {
        providerInstance.log("Checked!");
      } else {
        if (!providerInstance) {
          providerInstance = new CryptocompareProvider(eventData.state);
        } else {
          providerInstance = new CryptocompareProvider(providerInstance.state);
        }
        await providerInstance.start(eventData.state.subscriptions);
      }
      break;
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
      Log.warn("Unknown child process event type");
      process.send(["Unknown child process event type"]);
      break;
  }
});
