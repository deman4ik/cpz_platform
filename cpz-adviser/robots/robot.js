const uuid = require("uuid").v4;
const { createRobotSlug } = require("./utils");
const publishSignal = require("../signal/publishEvent");
/**
 * Класс робота
 *
 * @class Robot
 */
class Robot {
  /**
   *Конструктор
   * @param {Object} context
   * @param {Object} state
   */
  constructor(context, state) {
    this.context = context;
    this.id = state.id;
    this.name = state.name;
    this.exchange = state.exchange;
    this.exchangeId = state.exchangeId;
    this.baseq = state.baseq;
    this.quote = state.quote;
    this.timeframe = state.timeframe;
    this.indicatorsParams = state.indicatorsParams || {};
    this.indicators = state.indicators || {}; // this.initIndicators();
    this.currentCandle = state.currentCandle || {};
    this.candles = state.candles || [];
    this.advices = state.advices || [];
    this.variables = state.variables || [];
    this.initStrategy();
  }

  initStrategy() {
    try {
    this.stretegyFunc = require(`../strategies/${this.name}`).bind(this); // eslint-disable-line
      if (typeof this.stretegyFunc !== "function")
        throw new Error(`Strategy "${this.name}" is not a function`);
    } catch (err) {
      throw new Error(`Can't find strategy "${this.name}"`);
    }
  }
  /**
   *  Инициализация индикаторов
   *
   * @memberof Robot
   */
  initIndicators() {
    const indicators = {};
    Object.keys(this.indicatorsParams).forEach(key => {
      const prm = this.indicatorsParams[key];
      try {
        const newIndicator = {
          id: prm.id,
          name: prm.name,
          prevValues: [],
          value: null,
          calc: require(`../indicators/${prm.name}`),//eslint-disable-line
          ...prm
        };
        indicators[prm.id] = newIndicator;
      } catch (err) {
        this.context.log(err);
        throw new Error(`Can't inialize indicator ${prm.name}`);
      }
    });
    return indicators;
  }
  /**
   * Пересчет индикаторов
   *
   * @memberof Robot
   */
  async calcIndicators() {
    context.log("Calculating indicators");
    const results = await Promise.all(
      Object.keys(this.indicators).map(async key => {
        const indicator = this.indicators[key];
        const result = await indicator.calc(context);
        return result;
      })
    );
    this.context.log(results);
  }
  /**
   * Возвращает текущее состояние робота
   *
   * @returns
   * @memberof Robot
   */
  getCurrentState() {
    return {
      id: this.id,
      name: this.name,
      exchange: this.exchange,
      exchangeId: this.exchangeId,
      baseq: this.baseq,
      quote: this.quote,
      timeframe: this.timeframe,
      indicatorsParams: this.indicatorsParams,
      indicators: this.indicators,
      currentCandle: this.currentCandle,
      candles: this.candles,
      advices: this.advices,
      variables: this.variables
    };
  }
  /**
   * Обработка новой свечи
   *
   * @param {*} candle
   * @memberof Robot
   */
  handleCandle(candle) {
    // Обновить текущую свечу
    this.currentCandle = candle;
    this.candles.push(candle);
  }

  advice(signal) {
    const events = [
      {
        id: uuid(),
        subject: createRobotSlug(
          this.exchange,
          this.baseq,
          this.quote,
          this.timeframe
        ),
        dataVersion: "1.0",
        eventType: "CPZ.Signals.NewSignal",
        data: {
          AdvisorName: this.name,
          Action: "NewPosition",
          Price: 2000,
          Type: "limit",
          Direction: "sell",
          Exchange: "Binance",
          Baseq: "BTC",
          Quote: "USD",
          NumberOrderInRobot: "113",
          NumberPositionInRobot: "2",
          PercentVolume: 0
        },
        eventTime: new Date()
      }
    ];
    publishSignal(this.context, events);
  }
}

module.exports = Robot;
