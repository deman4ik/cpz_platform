import { Service, ServiceBroker, Context, Errors } from "moleculer";
import { v4 as uuid } from "uuid";
import { cpz } from "../../types/cpz";
import dayjs from "../../lib/dayjs";
import Robot from "../../state/robot/robot";
import { Op } from "sequelize";
import { sortAsc, chunkNumberToArray, round } from "../../utils";
import requireFromString from "require-from-string";

class BacktesterWorkerService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.BACKTESTER_WORKER,
      dependencies: [
        `${cpz.Service.DB_BACKTESTS}`,
        `${cpz.Service.DB_BACKTEST_POSITIONS}`,
        `${cpz.Service.DB_BACKTEST_SIGNALS}`,
        `${cpz.Service.DB_BACKTEST_LOGS}`,
        `${cpz.Service.DB_CANDLES}1`,
        `${cpz.Service.DB_CANDLES}5`,
        `${cpz.Service.DB_CANDLES}15`,
        `${cpz.Service.DB_CANDLES}30`,
        `${cpz.Service.DB_CANDLES}60`,
        `${cpz.Service.DB_CANDLES}120`,
        `${cpz.Service.DB_CANDLES}240`,
        `${cpz.Service.DB_CANDLES}480`,
        `${cpz.Service.DB_CANDLES}720`,
        `${cpz.Service.DB_CANDLES}1440`
      ],
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
      id: "ec7c0464-d06c-4691-b080-dec5271e3129",
      exchange: "bitfinex",
      asset: "BTC",
      currency: "USD",
      timeframe: 60,
      robotId: "b7a4fc1f-4a56-4557-b246-f5723661d4a7",
      strategyName: "parabolic",
      dateFrom: "2017-03-31T12:00:00.000Z",
      dateTo: "2019-09-01T00:00:00.000Z",
      settings: { local: true },
      robotSettings: {
        requiredHistoryMaxBars: 300
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
      robotId: robotId,
      exchange,
      asset,
      currency,
      timeframe,
      strategyName: strategyName,
      dateFrom: dateFrom,
      dateTo: dateTo,
      settings,
      robotSettings: robotSettings,
      status: cpz.Status.started,
      startedAt: dayjs.utc().toISOString(),
      finishedAt: null,
      totalBars: 0,
      processedBars: 0,
      leftBars: 0,
      completedPercent: 0
    };
    try {
      this.broker.emit(`${cpz.Event.BACKTESTER_STARTED}`, {
        id: backtesterState.id
      });
      const [existedBacktest] = await this.broker.call(
        `${cpz.Service.DB_BACKTESTS}.find`,
        { query: { id } }
      );

      if (existedBacktest) {
        this.logger.info("Found previous backtest. Deleting...");
        await this.broker.call(`${cpz.Service.DB_BACKTESTS}.remove`, { id });
      }
      const robotState = await this.broker.call(
        `${cpz.Service.DB_ROBOTS}.get`,
        { id: robotId }
      );

      const robot = new Robot({
        id: robotId,
        exchange,
        asset,
        currency,
        timeframe,
        strategyName,
        settings: { ...robotState.settings, ...robotSettings }
      });
      robot._log = this.logger.info.bind(this);
      backtesterState.robotSettings = robot.settings;
      await this.broker.call(`${cpz.Service.DB_BACKTESTS}.upsert`, {
        entity: backtesterState
      });
      let strategyCode;
      if (backtesterState.settings.local) {
        strategyCode = await import(
          `../../strategies/${backtesterState.strategyName}`
        );
      } else {
        const strategy: string = await this.broker.call(
          `${cpz.Service.DB_STRATEGIES}.get`,
          {
            id: backtesterState.strategyName
          }
        );
        if (!strategy)
          throw new Error(`Strategy ${backtesterState.strategyName} not found`);
        strategyCode = requireFromString(strategy);
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
          baseIndicatorsCode = await Promise.all(
            robot.baseIndicatorsFileNames.map(async fileName => {
              const indicator = await this.broker.call(
                `${cpz.Service.DB_INDICATORS}.get`,
                {
                  id: fileName
                }
              );
              if (!indicator)
                throw new Error(`Indicator ${fileName} not found`);
              const code = requireFromString(indicator);
              return { fileName, code };
            })
          );
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
            `Failed to load history candles required: ${robot.requiredHistoryMaxBars} bars but loaded: ${requiredCandles.length} bars`
          );
        const historyCandles = requiredCandles
          .sort((a: cpz.DBCandle, b: cpz.DBCandle) => sortAsc(a.time, b.time))
          .map(candle => ({ ...candle, timeframe }));
        const [firstCandle] = historyCandles;
        this.logger.info("History from", firstCandle.timestamp);
        robot.handleHistoryCandles(historyCandles);
      }

      backtesterState.totalBars = await this.broker.call(
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

      const iterations: number[] = chunkNumberToArray(
        backtesterState.totalBars,
        10000
      );
      let prevIteration: number = 0;
      let prevPercent = 0;
      const allPositions: { [key: string]: cpz.RobotPositionState } = {};
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

        const historyCandles: cpz.Candle[] = requiredCandles.map(candle => ({
          ...candle,
          timeframe
        }));
        prevIteration += iteration;
        this.logger.info(
          `Processing iteration from: ${historyCandles[0].timestamp} to: ${historyCandles[historyCandles.length - 1].timestamp}`
        );
        let logs: { id: string; backtestId: string; data: any }[] = [];
        let alerts: cpz.BacktesterSignals[] = [];
        let trades: cpz.BacktesterSignals[] = [];
        const positions: { [key: string]: cpz.BacktesterPositionState } = {};

        for (const candle of historyCandles) {
          robot.handleCandle(candle);

          // Checking alerts
          robot.clearEvents();
          robot.checkAlerts();

          logs = [
            ...logs,
            ...robot.logEventsToSend.map(log => ({
              id: uuid(),
              backtestId: backtesterState.id,
              data: log.data
            }))
          ];
          trades = [
            ...trades,
            ...robot.tradeEventsToSend.map(({ data }) => ({
              ...data,
              backtestId: backtesterState.id
            }))
          ];
          robot.positionsToSave.forEach(pos => {
            positions[pos.id] = { ...pos, backtestId: backtesterState.id };
            allPositions[pos.id] = pos;
          });

          // Running strategy
          robot.clearEvents();
          await robot.calcIndicators();
          robot.runStrategy();
          robot.finalize();

          logs = [
            ...logs,
            ...robot.logEventsToSend.map(log => ({
              id: uuid(),
              backtestId: backtesterState.id,
              data: log.data
            }))
          ];
          alerts = [
            ...alerts,
            ...robot.alertEventsToSend.map(({ data }) => ({
              ...data,
              backtestId: backtesterState.id
            }))
          ];
          trades = [
            ...trades,
            ...robot.tradeEventsToSend.map(({ data }) => ({
              ...data,
              backtestId: backtesterState.id
            }))
          ];

          robot.positionsToSave.forEach(pos => {
            positions[pos.id] = { ...pos, backtestId: backtesterState.id };
            allPositions[pos.id] = pos;
          });

          /*this.logger.info(
            `logs ${logs.length} - alerts ${alerts.length} - trades ${
              trades.length
            } - postions ${Object.keys(positions).length}`
          );*/
          backtesterState.processedBars += 1;
          backtesterState.leftBars =
            backtesterState.totalBars - backtesterState.processedBars;
          backtesterState.completedPercent = round(
            (backtesterState.processedBars / backtesterState.totalBars) * 100
          );
          if (backtesterState.completedPercent > prevPercent) {
            prevPercent = backtesterState.completedPercent;
            this.logger.info(
              `Processed ${backtesterState.processedBars} bars, left ${backtesterState.leftBars} - ${backtesterState.completedPercent}%`
            );
          }
        }

        if (Object.keys(positions).length > 0)
          await this.broker.call(
            `${cpz.Service.DB_BACKTEST_POSITIONS}.upsert`,
            { entities: Object.values(positions) }
          );
        if (alerts.length > 0)
          await this.broker.call(`${cpz.Service.DB_BACKTEST_SIGNALS}.insert`, {
            entities: alerts
          });
        if (trades.length > 0)
          await this.broker.call(`${cpz.Service.DB_BACKTEST_SIGNALS}.insert`, {
            entities: trades
          });
        if (logs.length > 0)
          await this.broker.call(`${cpz.Service.DB_BACKTEST_LOGS}.insert`, {
            entities: logs
          });
        await this.broker.call(`${cpz.Service.DB_BACKTESTS}.upsert`, {
          entity: backtesterState
        });
      }

      robot.calcStats(Object.values(allPositions));
      backtesterState.statistics = robot.statistics;
      const { state, indicators } = robot.state;
      backtesterState.robotState = state;
      backtesterState.robotIndicators = indicators;
      backtesterState.finishedAt = dayjs.utc().toISOString();
      backtesterState.status = cpz.Status.finished;
      const duration = dayjs
        .utc(backtesterState.finishedAt)
        .diff(dayjs.utc(backtesterState.startedAt), "minute");

      this.logger.info(`Backtest finished after ${duration} minutes!`);
      this.broker.emit(`${cpz.Event.BACKTESTER_FINISHED}`, {
        id: backtesterState.id
      });
    } catch (e) {
      this.logger.error(e);
      backtesterState.status = cpz.Status.failed;
      backtesterState.error = e.message;
      await this.broker.call(`${cpz.Service.DB_BACKTESTS}.upsert`, {
        entity: backtesterState
      });
      this.broker.emit(`${cpz.Event.BACKTESTER_FAILED}`, {
        id: backtesterState.id,
        error: e
      });
    }
  }
}

export = BacktesterWorkerService;
