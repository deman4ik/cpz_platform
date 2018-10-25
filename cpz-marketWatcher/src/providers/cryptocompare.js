import "babel-polyfill";
import VError from "verror";
import io from "socket.io-client";
import { v4 as uuid } from "uuid";
import { MARKETWATCHER_SERVICE } from "cpzServices";
import { ERROR_MARKETWATCHER_EVENT, ERROR_TOPIC } from "cpzEventTypes";
import { createErrorOutput } from "cpzUtils/error";
import publishEvents from "cpzEvents";
import { STATUS_STARTED, STATUS_STOPPED, STATUS_ERROR } from "cpzState";
import BaseProvider from "./baseProvider";

let providerInstance;

class CryptocompareProvider extends BaseProvider {
  constructor(state) {
    super(state);
    // Создаем новое подключение к провайдеру Cryptocompare
    this._socket = io("https://streamer.cryptocompare.com/");
    this._subscribeToSocketEvents();
  }

  _currentToObject(value) {
    // {Type}~{ExchangeName}~{FromCurrency}~{ToCurrency}~{Flag}~{Price}~{LastUpdate}~{LastVolume}~{LastVolumeTo}~{LastTradeId}~{Volume24h}~{Volume24hTo}~{MaskInt}
    const valuesArray = value.split("~");
    const getDirection = dir => {
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
    };

    const type = valuesArray[0];
    if (type === "2") {
      const mask = valuesArray[valuesArray.length - 1].toString().slice(-1);
      if (mask === "9") {
        const obj = {
          tickId: uuid(),
          exchange: valuesArray[1],
          asset: valuesArray[2],
          currency: valuesArray[3],
          direction: getDirection(valuesArray[4]),
          price: parseFloat(valuesArray[5]),
          timestamp: new Date(
            parseInt(valuesArray[6], 10) * 1000
          ).toISOString(),
          volume: parseFloat(valuesArray[8]),
          tradeId: valuesArray[9]
        };
        return obj;
      }
    }
    return null;
  }

  _subscribeToSocketEvents() {
    this._socket.on("connect", async () => {
      this._socketStatus = "connect";
      await this._save();
    });
    // При получении нового сообщения
    this._socket.on("m", async message => {
      const currentPrice = this._currentToObject(message);
      if (currentPrice) {
        process.send(JSON.stringify(currentPrice));
        await this._publishTick(currentPrice);
        await this._saveTick(currentPrice);
      }
    });

    // При disconnectе
    this._socket.on("disconnect", async reason => {
      this._socketStatus = reason;
      if (reason === "io server disconnect") {
        // the disconnection was initiated by the server, you need to reconnect manually
        this._socket.connect();
      }
      await this._save();
      // else the socket will automatically try to reconnect
    });

    // Если произошла ошибка
    this._socket.on("error", async error => {
      this._socketStatus = "error";
      const errorOutput = createErrorOutput(
        new VError(
          {
            name: "CryptocompareStreamingError",
            cause: new Error(error),
            info: this._getCurrentState()
          },
          'Cryptocompare streaming error - task "%s" on host "%s"',
          this._taskId,
          this._hostId
        )
      );
      this.log(errorOutput);
      this._error = errorOutput;
      await publishEvents(ERROR_TOPIC, {
        service: MARKETWATCHER_SERVICE,
        subject: this._eventSubject,
        eventType: ERROR_MARKETWATCHER_EVENT,
        data: {
          taskId: this._taskId,
          hostId: this._hostId,
          error: errorOutput
        }
      });
      await this._save();
    });

    // Если все попытки переподключения исчерпаны
    this._socket.on("reconnect_failed", async () => {
      this._socketStatus = "reconnect_failed";
      this._status = STATUS_ERROR;
      const errorOutput = createErrorOutput(
        new VError(
          {
            name: "CryptocompareStreamingError",
            info: this._getCurrentState()
          },
          'Cryptocompare streaming error - Reconnect failed - task "%s" on host "%s"',
          this._taskId,
          this._hostId
        )
      );
      this.log(errorOutput);
      this._error = errorOutput;
      await publishEvents(ERROR_TOPIC, {
        service: MARKETWATCHER_SERVICE,
        subject: this._eventSubject,
        eventType: ERROR_MARKETWATCHER_EVENT,
        data: {
          taskId: this._taskId,
          hostId: this._hostId,
          error: errorOutput
        }
      });
      await this._save();
    });
  }

  async start() {
    try {
      const activeSubs = this._subscriptions.map(
        sub => `2~${sub.exchange}~${sub.asset}~${sub.currency}`
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
              'Can\'t open connection to Cryptocompare - task "%s" on host "%s"',
              this._taskId,
              this._hostId
            );
          }
        }, 1000);
      }

      this._socket.emit("SubAdd", { subs: activeSubs });
      this._status = STATUS_STARTED;
      await this._save();
    } catch (error) {
      const errorOutput = createErrorOutput(
        new VError(
          {
            name: "CryptocompareStreamingError",
            cause: error,
            info: this._getCurrentState()
          },
          'Cryptocompare start streaming error - task "%s" on host "%s"',
          this._taskId,
          this._hostId
        )
      );
      this.log(errorOutput);
      this._error = errorOutput;
      await publishEvents(ERROR_TOPIC, {
        service: MARKETWATCHER_SERVICE,
        subject: this._eventSubject,
        eventType: ERROR_MARKETWATCHER_EVENT,
        data: {
          taskId: this._taskId,
          hostId: this._hostId,
          error: errorOutput
        }
      });
      await this._save();
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
      const newSubs = subscriptions.map(
        sub => `2~${sub.exchange}~${sub.asset}~${sub.currency}`
      );
      this._socket.emit("SubAdd", { subs: newSubs });
      await this._save();
    } catch (error) {
      const errorOutput = createErrorOutput(
        new VError(
          {
            name: "CryptocompareStreamingError",
            cause: error,
            info: this._getCurrentState()
          },
          'Cryptocompare subscribe streaming error - task "%s" on host "%s"',
          this._taskId,
          this._hostId
        )
      );
      this.log(errorOutput);
      this._error = errorOutput;
      await publishEvents(ERROR_TOPIC, {
        service: MARKETWATCHER_SERVICE,
        subject: this._eventSubject,
        eventType: ERROR_MARKETWATCHER_EVENT,
        data: {
          taskId: this._taskId,
          hostId: this._hostId,
          error: errorOutput
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
            del =>
              del.exchange === sub.exchange &&
              del.asset === sub.asset &&
              del.currency === sub.currency
          )
      );

      const delSubs = subscriptions.map(
        sub => `2~${sub.exchange}~${sub.asset}~${sub.currency}`
      );
      this._socket.emit("SubRemove", { subs: delSubs });
      await this._save();
    } catch (error) {
      const errorOutput = createErrorOutput(
        new VError(
          {
            name: "CryptocompareStreamingError",
            cause: error,
            info: this._getCurrentState()
          },
          'Cryptocompare unsubscribe streaming error - task "%s" on host "%s"',
          this._taskId,
          this._hostId
        )
      );
      this.log(errorOutput);
      this._error = errorOutput;
      await publishEvents(ERROR_TOPIC, {
        service: MARKETWATCHER_SERVICE,
        subject: this._eventSubject,
        eventType: ERROR_MARKETWATCHER_EVENT,
        data: {
          taskId: this._taskId,
          hostId: this._hostId,
          error: errorOutput
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
      process.send("Unknown child process event type");
      break;
  }
});
