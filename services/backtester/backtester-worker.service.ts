import { Service, ServiceBroker, Context, Errors } from "moleculer";
import { v4 as uuid } from "uuid";
import { cpz } from "../../types/cpz";
import dayjs from "../../lib/dayjs";
import Microjob from "../../mixins/microjob";
import Robot from "../../state/robot/robot";
import { Op } from "sequelize";
import { sortAsc, chunkNumberToArray } from "../../utils";

class BacktesterWorkerService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.BACKTESTER_WORKER,
      mixins: [Microjob],
      actions: {
        test: ctx => {
          this.logger.info("test");
        }
      },
      events: {
        [cpz.Event.BACKTESTER_WORKER_START]: this.handleStartEvent
      },
      started: this.startedService,
      stopped: this.stoppedService
    });
  }

  async startedService() {}

  async stoppedService() {}

  async handleStartEvent(ctx: Context) {
    this.logger.info("start");

    const res = await this.execute({
      id: uuid(),
      exchange: "bitfinex",
      asset: "BTC",
      currency: "USD",
      timeframe: 1,
      robotId: "TEST",
      strategyName: "t2_trend_friend",
      dateFrom: "2019-07-03T00:00:00.000Z",
      dateTo: "2019-07-04T01:00:00.000Z",
      settings: { local: true },
      robotSettings: {
        requiredHistoryMaxBars: 30
      }
    });
  }

  async execute({
    id,
    robotId,
    exchange,
    asset,
    currency,
    timeframe,
    strategyName,
    dateFrom,
    dateTo,
    settings,
    robotSettings
  }: {
    id: string;
    robotId: string;
    exchange: string;
    asset: string;
    currency: string;
    timeframe: cpz.Timeframe;
    strategyName: string;
    dateFrom: string;
    dateTo: string;
    settings: { [key: string]: any };
    robotSettings: { [key: string]: any };
  }) {
    const backtesterState: cpz.BacktesterState = {
      id,
      robot_id: robotId,
      exchange,
      asset,
      currency,
      timeframe,
      strategy_name: strategyName,
      dateFrom,
      dateTo,
      settings,
      robot_settings: robotSettings,
      status: cpz.Status.started,
      started_at: dayjs.utc().toISOString(),
      finsihed_at: null,
      total_bars: 0,
      processed_bars: 0,
      left_bars: 0,
      completed_percent: 0
    };
    try {
      const robot = new Robot({
        robot_id: robotId,
        exchange,
        asset,
        currency,
        timeframe,
        strategy_name: strategyName,
        settings: robotSettings,
        log: this.logger.info
      });
      backtesterState.robot_settings = robot.settings;

      let strategyCode;
      if (backtesterState.settings.local) {
        strategyCode = await import(
          `../../strategies/${backtesterState.strategy_name}`
        );
      } else {
        //TODO
        throw Error("Not implemented");
      }
      robot.setStrategy(strategyCode);
      robot.initStrategy();

      if (robot.hasBaseIndicators) {
        let baseIndicatorsCode;
        if (backtesterState.settings.local) {
          baseIndicatorsCode = await Promise.all(
            robot.baseIndicatorsFileNames.map(async fileName => {
              const code = await import(`../../indicators/${fileName}`);
              return { fileName, code };
            })
          );
        } else {
          //TODO
          throw Error("Not implemented");
        }

        robot.setBaseIndicatorsCode(baseIndicatorsCode);
      }

      robot.setIndicators();
      robot.initIndicators();

      // Required history candles
      if (robot.requiredHistoryMaxBars > 0) {
        const requiredCandles: cpz.DBCandle[] = await this.broker.call(
          `${cpz.Service.DB_CANDLES}${timeframe}.find`,
          {
            limit: robot.requiredHistoryMaxBars,
            sort: "-time",
            query: {
              exchange,
              asset,
              currency,
              time: {
                [Op.lt]: dayjs.utc(dateFrom).valueOf()
              }
            }
          }
        );
        if (requiredCandles.length < robot.requiredHistoryMaxBars)
          throw new Error(
            `Failed to load history candles required: ${
              robot.requiredHistoryMaxBars
            } bars but loaded: ${requiredCandles.length} bars`
          );
        const historyCandles = requiredCandles
          .sort((a: cpz.DBCandle, b: cpz.DBCandle) => sortAsc(a.time, b.time))
          .map(candle => ({ ...candle, timeframe }));

        robot.handleHistoryCandles(historyCandles);
      }

      backtesterState.total_bars = await this.broker.call(
        `${cpz.Service.DB_CANDLES}${timeframe}.count`,
        {
          query: {
            exchange,
            asset,
            currency,
            time: {
              [Op.gte]: dayjs.utc(dateFrom).valueOf(),
              [Op.lte]: dayjs.utc(dateTo).valueOf()
            }
          }
        }
      );
      this.logger.warn(backtesterState.total_bars);

      const iterations: number[] = chunkNumberToArray(
        backtesterState.total_bars,
        10000
      );
      this.logger.warn(iterations);
      let prevIteration: number = 0;
      let prevPercent = 0;
      for (const iteration of iterations) {
        this.logger.info(`Loading ${iteration} candle from DB...`);
        const requiredCandles: cpz.DBCandle[] = await this.broker.call(
          `${cpz.Service.DB_CANDLES}${timeframe}.find`,
          {
            limit: iteration,
            offset: prevIteration,
            sort: "time",
            query: {
              exchange,
              asset,
              currency,
              time: {
                [Op.gte]: dayjs.utc(dateFrom).valueOf(),
                [Op.lte]: dayjs.utc(dateTo).valueOf()
              }
            }
          }
        );
        this.logger.warn(requiredCandles.length);
        const historyCandles: cpz.Candle[] = requiredCandles.map(candle => ({
          ...candle,
          timeframe
        }));
        prevIteration += iteration;
        this.logger.info(
          `Processing iteration from: ${historyCandles[0].timestamp} to: ${
            historyCandles[historyCandles.length - 1].timestamp
          }`
        );
        let logs: cpz.Events[] = [];
        let alerts: cpz.Events[] = [];
        let trades: cpz.Events[] = [];
        const positions: { [key: string]: cpz.RobotPositionState } = {};

        for (const candle of historyCandles) {
          robot.handleCandle(candle);

          // Checking alerts
          robot.clearEvents();
          robot.checkAlerts();

          logs = robot.logEventsToSend;
          trades = robot.tradeEventsToSend;
          robot.positionsToSave.forEach(pos => {
            positions[pos.id] = pos;
          });

          // Running strategy
          robot.clearEvents();
          await robot.calcIndicators();
          robot.runStrategy();
          robot.finalize();

          logs = [...logs, ...robot.logEventsToSend];
          alerts = robot.alertEventsToSend;
          trades = [...trades, ...robot.tradeEventsToSend];
          robot.positionsToSave.forEach(pos => {
            positions[pos.id] = pos;
          });
        }

        //TODO: Save data
        backtesterState.processed_bars += 1;
        backtesterState.left_bars =
          backtesterState.total_bars - backtesterState.processed_bars;
        backtesterState.completed_percent = Math.round(
          (backtesterState.processed_bars / backtesterState.total_bars) * 100
        );
        if (backtesterState.completed_percent > prevPercent) {
          prevPercent = backtesterState.completed_percent;
          this.logger.info(
            `Processed ${backtesterState.processed_bars} bars, left ${
              backtesterState.left_bars
            } - ${backtesterState.completed_percent}%`
          );
        }
      }

      backtesterState.finsihed_at = dayjs.utc().toISOString();
      backtesterState.status = cpz.Status.finished;
      const duration = dayjs
        .utc(backtesterState.finsihed_at)
        .diff(dayjs.utc(backtesterState.started_at), "minute");

      this.logger.info(`Backtest finished after ${duration} minutes!`);
      //TODO: Send finished event
    } catch (e) {
      this.logger.error(e);
      backtesterState.status = cpz.Status.failed;
      backtesterState.error = e.message;
      //TODO: Send event and save state
    }
  }
}

export = BacktesterWorkerService;
