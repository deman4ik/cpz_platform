import VError from "verror";
import { STATUS_STARTED, STATUS_PENDING, STATUS_STOPPED } from "cpzState";
import {
  isProcessExists,
  createNewProcess,
  sendEventToProcess
} from "../global";

class Marketwatcher {
  constructor(context, state) {
    /* Текущий контекст выполнения */
    this._context = context;
    /* Тема события */
    this._eventSubject = state.eventSubject;
    /* Уникальный идентификатор задачи */
    this._taskId = state.taskId;
    /* Уникальный идентификатор хоста */
    this._hostId = process.env.HOST_ID;
    /* Режим работы ['backtest', 'emulator', 'realtime'] */
    this._mode = state.mode;
    /* Режима дебага [true,false] */
    this._debug = state.debug || false;
    /* Поставщик данных */
    this._provider = state.provider;
    /* Список подписок */
    this._subscriptions = state.subscriptions || [];
    /* Текущий статус сервиса */
    this._status = state.status || STATUS_PENDING;
    /* Метаданные стореджа */
    this._metadata = state.metadata;
  }

  start() {
    if (isProcessExists(this._taskId)) {
      throw new VError(
        {
          name: "MarketwatcherError",

          info: {
            taskId: this._taskId,
            hostId: this._hostId
          }
        },
        'Marketwatcher task "%s" on host "%s" already started',
        this._taskId,
        this._hostId
      );
    }

    createNewProcess(this._context, this._taskId, this._provider);
    sendEventToProcess({
      type: "start",
      taskId: this._taskId,
      hostId: this._hostId,
      subscriptions: this._subscriptions
    });
    this._status = STATUS_STARTED;
  }

  stop() {
    sendEventToProcess({ type: "stop" });
    this._status = STATUS_STOPPED;
  }

  subscribe(subscriptions) {
    sendEventToProcess({ type: "subscribe", subscriptions });
    this._subscriptions = { ...this._subscriptions, ...subscriptions };
  }

  unsubscribe(subscriptions) {
    sendEventToProcess({ type: "unsubscribe", subscriptions });
    this._subscriptions = this._subscriptions.filter(
      el => !subscriptions.includes(el)
    );
  }

  getCurrentState() {
    return {
      taskId: this._taskId,
      hostId: this._hostId,
      mode: this._mode,
      debug: this._debug,
      subscriptions: this._subscriptions
    };
  }

  save() {}
}

export default Marketwatcher;
