const uuid = require("uuid").v4;
const dayjs = require("dayjs");
const {
  STATUS_STARTED,
  STATUS_STOPPED,
  CANDLES_NEW_CANDLE_EVENT,
  LOG_EVENT
} = require("../config");
const { saveCandle } = require("../db/saveCandles");
const { saveCandlebatcherState } = require("../tableStorage");
const { publishEvents, createEvents } = require("../eventgrid");

/**
 * Класс Candlebatcher
 *
 * @class Candlebatcher
 */
class Candlebatcher {
  constructor(context, state) {
    this.context = context; // текущий контекст выполнения
    this.eventSubject = state.eventSubject; // тема события
    this.taskId = state.taskId; // уникальный идентификатор задачи
    this.mode = state.mode; // режим работы ['backtest', 'emulator', 'realtime']
    this.debug = state.debug; // режима дебага [true,false]
    this.providerType = state.providerType; // тип провайдера ['cryptocompare','ccxt']
    this.exchange = state.exchange; // код биржи
    this.asset = state.asset; // базовая валюта
    this.currency = state.currency; // котировка валюты
    this.timeframes = state.timeframes; // массив таймфреймов [1,5,30,60]
    this.lastLoadedCandle = state.lastLoadedCandle || {}; // последняя загруженная минутная свеча
    this.lastCandles = state.lastCandles || {}; // объект с последними свечами в различных таймфреймах
    this.sendedCandles = state.sendedCandles || {}; // недавно отправленные свечи в различных таймфреймах
    this.proxy = state.proxy; // адрес прокси сервера
    this.updateRequested = state.updateRequested || false; // объект запроса на обновление параметров {debug,proxy,timeframes,eventSubject} или false
    this.stopRequested = state.stopRequested || false; // признак запроса на остановку сервиса [true,false]
    this.status = this.stopRequested
      ? STATUS_STOPPED
      : state.status || STATUS_STARTED; // текущий статус сервиса
    this.startedAt = state.startedAt || dayjs().toJSON(); //  Дата и время запуска
    this.endedAt =
      state.endedAt || this.status === STATUS_STOPPED ? dayjs().toJSON() : ""; // Дата и время остановки
    this.initConnector();
    this.log(`Candlebatcher ${this.eventSubject} initialized`);
  }
  /**
   * Инициализация функции коннектора
   *
   * @memberof Candlebatcher
   */
  initConnector() {
    this.log(`initConnector()`);
    try {
      // TODO: check connection
      // Динамически подгружаем функцию загрузки свечей
      this.loadCandlesFunc = require(`../connectors/${this.providerType}`); // eslint-disable-line
      // Если полученные объект не функция
      if (typeof this.loadCandlesFunc !== "function")
        // Генерируем ошибку
        throw new Error(`Connector "${this.providerType}" is not a function`);
    } catch (err) {
      // Если не найдена функция для данного коннектора - ошибка
      throw new Error(`Can't find connector "${this.providerType}"`);
    }
  }
  /**
   * Логирование в консоль
   *
   * @param {*} args
   * @memberof Candlebatcher
   */
  log(...args) {
    if (this.debug) {
      this.context.log.info(`Candlebatcher ${this.eventSubject}:`, ...args);
    }
  }
  /**
   * Логирование в EventGrid в топик CPZ-LOGS
   *
   * @param {*} data
   * @memberof Candlebatcher
   */
  logEvent(data) {
    // Публикуем событие - ошибка
    publishEvents(
      this.context,
      "log",
      createEvents({
        subject: this.eventSubject,
        eventType: LOG_EVENT,
        data: {
          taskId: this.taskId,
          data
        }
      })
    );
  }

  /**
   * Запрос текущего статуса сервиса
   *
   * @returns
   * @memberof Candlebatcher
   */
  getStatus() {
    return this.status;
  }

  /**
   * Запрос текущего признака обновления параметров
   *
   * @returns
   * @memberof Candlebatcher
   */
  getUpdateRequested() {
    return this.updateRequested;
  }

  /**
   * Установка статуса сервиса
   *
   * @param {*} status
   * @memberof Candlebatcher
   */
  setStatus(status) {
    if (status) this.status = status;
  }

  /**
   * Установка новых параметров
   *
   * @param {*} [updatedFields=this.updateRequested]
   * @memberof Candlebatcher
   */
  setUpdate(updatedFields = this.updateRequested) {
    this.log(`setStatus()`, updatedFields);
    this.debug = updatedFields.debug;
    this.timeframes = updatedFields.timeframes;
    this.proxy = updatedFields.proxy;
  }

  /**
   * Установка объекта с ошибкой
   *
   * @param {*} error
   * @memberof Candlebatcher
   */
  setError(error) {
    if (error)
      this.error = {
        time: new Date().toISOString(),
        error
      };
  }

  /**
   * Загрузка новой минутной свечи
   *
   * @returns
   * @memberof Candlebatcher
   */
  async loadCandle() {
    // Инициализация входных параметров
    const input = {
      exchange: this.exchange,
      asset: this.asset,
      currency: this.currency,
      timeframe: 1,
      limit: 1
    };
    // Вызов функции коннектора
    const result = await this.loadCandlesFunc(this.context, input);
    this.log(`loadCandles() result:`, result);
    // Если еще не было загруженных свечей или дата загруженный свечи не равна дате текущей свечи
    if (
      !Object.prototype.hasOwnProperty.call(this.lastLoadedCandle, "time") ||
      this.lastLoadedCandle.time !== result.data.time
    ) {
      // Сохраняем новую загруженную свечу
      this.lastLoadedCandle = result.data;
      // Возвращаем успех
      return { isSuccess: true };
    }
    // Иначе возвращем ошибку - данная свеча уже была загружена
    return { isSuccess: false, error: "Loaded same candle." };
  }

  /**
   * Сохранение свечи в базу данных
   * Запрос свечей в различных таймфреймах из базы данных
   *
   * @returns
   * @memberof Candlebatcher
   */
  async saveCandle() {
    this.log(`saveCandle()`);
    // Инициализация входных параметров
    const input = {
      exchange: this.exchange,
      asset: this.asset,
      currency: this.currency,
      ...this.lastLoadedCandle
    };
    // Вызов функции сохранения
    const result = await saveCandle(this.context, input);
    this.log(`saveCandle() result:`, result);
    // Если успешно
    if (result.isSuccess) {
      // Но есть ошибка бизнес логики
      if (result.data.error) {
        // и ошибка формирования таймфреймов
        if (result.data.error.code === "timeframe")
          // создаем новый запрос на импорт недостающих свечей
          return {
            taskId: uuid(),
            eventSubject: this.eventSubject,
            mode: this.mode,
            debug: this.debug,
            error: result.data.error,
            exchange: this.exchange,
            asset: this.asset,
            currency: this.currency,
            providerType: "ccxt",
            isSuccess: false,
            importRequested: true,
            timeframe: 1,
            dateFrom: dayjs(result.data.error.start * 1000).toJSON(),
            dateTo: dayjs(result.data.error.end * 1000).toJSON()
          };
        // иначе возращаем ошибку
        return result.error;
      }
      // если все успешно сохраняем последние свечи
      this.lastCandles = result.data;
      // возращаем - успех
      return { isSuccess: true };
    }
    return result;
  }

  /**
   * Генерация темы события NewCandle
   *
   * @param {*} timeframe
   * @returns
   * @memberof Candlebatcher
   */
  createSubject(timeframe) {
    const modeToStr = mode => {
      switch (mode) {
        case "realtime":
          return "R";
        case "backtest":
          return "B";
        case "emulator":
          return "E";
        default:
          return "R";
      }
    };
    return `${this.exchange}/${this.asset}/${this.currency}/${timeframe ||
      JSON.stringify(this.timeframes)}/${this.taskId}.${modeToStr(this.mode)}`;
  }
  /**
   * Генерация событий NewCandle
   *
   * @returns
   * @memberof Candlebatcher
   */
  getEvents() {
    this.log(`getEvents()`);
    const events = [];
    const currentSendedCandles = {};
    // Идем по недавно загруженным свечам
    Object.keys(this.lastCandles).forEach(key => {
      // Берем числовое значение таймфрейма
      const currentTimeframe = parseInt(key.replace("timeframe", ""), 10);
      // Если в настройках указан данный таймфрейм
      if (this.timeframes.includes(parseInt(currentTimeframe, 10))) {
        // Недавно загруженная свеча в нужном таймфрейме
        const current = this.lastCandles[key];
        // Уже отправленная свеча в нужном таймфрейме
        const sended = this.sendedCandles[key];
        this.log(current);
        this.log(sended);
        // Если текущая свеча еще не отправлялась
        if (!sended || current.id !== sended.id) {
          this.log(currentTimeframe);
          // Создаем новое событие
          const newEvent = {
            id: uuid(),
            dataVersion: "1.0",
            eventTime: new Date(),
            subject: this.createSubject(currentTimeframe),
            eventType: CANDLES_NEW_CANDLE_EVENT,
            data: {
              candleId: current.id,
              exchange: this.exchange,
              asset: this.asset,
              currency: this.currency,
              timeframe: currentTimeframe,
              time: current.time || current.end,
              open: current.open,
              close: current.close,
              high: current.high,
              low: current.low,
              volume: current.volume
            }
          };
          // Добавляем свечу в объект отправленных свечей
          currentSendedCandles[key] = {
            ...current,
            exchange: this.exchange,
            asset: this.asset,
            currency: this.currency,
            time: current.time || current.end
          };
          // Добавляем событие в массив отправляемых событий
          events.push(newEvent);
        }
      }
    });
    // Сохраняем объект отправленных свечей
    this.sendedCandles = currentSendedCandles;
    // Возвращаем массив событий
    return events;
  }
  /**
   * Запрос всего текущего состояния
   *
   * @returns
   * @memberof Candlebatcher
   */
  getCurrentState() {
    return {
      taskId: this.taskId,
      eventSubject: this.eventSubject,
      mode: this.mode,
      debug: this.debug,
      providerType: this.providerType,
      exchange: this.exchange,
      asset: this.asset,
      currency: this.currency,
      timeframes: this.timeframes,
      lastLoadedCandle: this.lastLoadedCandle,
      sendedCandles: this.sendedCandles,
      proxy: this.proxy,
      status: this.status,
      error: this.error,
      startedAt: this.startedAt,
      endedAt: this.endedAt
    };
  }

  /**
   * Сохранение всего текущего состояния в локальное хранилище
   *
   * @memberof Candlebatcher
   */
  async save() {
    this.log(`save()`);
    const state = this.getCurrentState();

    if (this.updateRequested) {
      // Обнуляем запрос на обновление параметров
      state.updateRequested = false;
    }
    if (this.stopRequested) {
      // Обнуляем запрос на остановку сервиса
      state.stopRequested = false;
    }
    // Сохраняем состояние в локальном хранилище
    const result = await saveCandlebatcherState(this.context, state);
    if (!result.isSuccess)
      throw new Error(`Can't update state\n${result.error}`);
  }

  /**
   * Завершение работы итерации
   *
   * @param {*} status
   * @param {*} error
   * @memberof Candlebatcher
   */
  async end(status, error) {
    this.log(`end()`);
    this.setStatus(status);
    this.setError(error);
    await this.save();
  }
}

module.exports = Candlebatcher;
