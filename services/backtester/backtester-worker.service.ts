import { Service, ServiceBroker, Context, Errors } from "moleculer";
import QueueService from "moleculer-bull";
import { Job } from "bull";
import { v4 as uuid } from "uuid";
import { cpz } from "../../types/cpz";
import dayjs from "../../lib/dayjs";
import Robot from "../../state/robot/robot";
import { Op } from "sequelize";
import { sortAsc, chunkNumberToArray, round, chunkArray } from "../../utils";
import requireFromString from "require-from-string";
import { combineBacktestSettings } from "../../state/settings";

class BacktesterWorkerService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.BACKTESTER_WORKER,
      mixins: [
        QueueService({
          redis: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD,
            tls: process.env.REDIS_TLS
          },
          settings: {
            lockDuration: 120000,
            lockRenewTime: 10000,
            stalledInterval: 120000,
            maxStalledCount: 1
          }
        })
      ],
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
        `${cpz.Service.DB_CANDLES}1440`,
        `${cpz.Service.DB_ROBOTS}`,
        `${cpz.Service.DB_ROBOT_POSITIONS}`
      ],
      queues: {
        [cpz.Queue.backtest]: {
          concurrency: 10,
          async process(job: Job) {
            try {
              return await this.execute(job);
            } catch (e) {
              this.logger.error(e);
              throw e;
            }
          }
        }
      }
    });
  }

  async execute(job: Job) {
    const {
      id,
      robotId,
      dateFrom,
      dateTo,
      settings,
      robotSettings
    }: {
      id: string;
      robotId: string;
      dateFrom: string;
      dateTo: string;
      settings?: cpz.BacktesterSettings;
      robotSettings?: cpz.RobotSettings;
    } = job.data;

    const backtesterState: cpz.BacktesterState = {
      id,
      robotId: robotId,
      dateFrom: dateFrom,
      dateTo: dateTo,
      settings: combineBacktestSettings(settings),
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
      this.logger.info(`Job #${job.id} start backtest`);
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

      const { exchange, asset, currency, timeframe, strategyName } = robotState;

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
      backtesterState.exchange = exchange;
      backtesterState.asset = asset;
      backtesterState.currency = currency;
      backtesterState.timeframe = timeframe;
      backtesterState.strategyName = strategyName;

      await this.broker.call(`${cpz.Service.DB_BACKTESTS}.upsert`, {
        entity: backtesterState
      });
      let strategyCode;
      if (backtesterState.settings.local) {
        strategyCode = await import(
          `../../strategies/${backtesterState.strategyName}`
        );
      } else {
        const { file } = await this.broker.call(
          `${cpz.Service.DB_STRATEGIES}.get`,
          {
            id: backtesterState.strategyName
          }
        );
        if (!file)
          throw new Error(`Strategy ${backtesterState.strategyName} not found`);
        strategyCode = requireFromString(file);
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
              const { file } = await this.broker.call(
                `${cpz.Service.DB_INDICATORS}.get`,
                {
                  id: fileName
                }
              );
              if (!file) throw new Error(`Indicator ${fileName} not found`);
              const code = requireFromString(file);
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
      let firstCandleTimestamp = null;
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
        if (!firstCandleTimestamp)
          firstCandleTimestamp = historyCandles[0].timestamp;
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
            const newPos = {
              ...pos,
              entryDate: pos.entryCandleTimestamp,
              exitDate: pos.exitCandleTimestamp
            };
            positions[pos.id] = { ...newPos, backtestId: backtesterState.id };
            allPositions[pos.id] = newPos;
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
            await job.progress(backtesterState.completedPercent);
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

      robot.calcStats(
        Object.values(allPositions).filter(
          ({ status }) => status === cpz.RobotPositionStatus.closed
        )
      );

      const {
        state,
        indicators,
        statistics,
        equity,
        lastCandle,
        hasAlerts
      } = robot.state;
      backtesterState.statistics = statistics;
      backtesterState.equity = equity;
      backtesterState.robotState = state;
      backtesterState.robotIndicators = indicators;

      if (backtesterState.settings.populateHistory) {
        await this.broker.call(`${cpz.Service.DB_ROBOTS}.update`, {
          id: robotId,
          startedAt: firstCandleTimestamp,
          stoppedAt: null,
          hasAlerts,
          lastCandle,
          indicators,
          state,
          statistics,
          equity
        });
        const chunks = chunkArray(Object.values(allPositions), 100);
        for (const chunk of chunks) {
          await this.broker.call(`${cpz.Service.DB_ROBOT_POSITIONS}.upsert`, {
            entities: chunk
          });
        }
      }

      backtesterState.finishedAt = dayjs.utc().toISOString();
      backtesterState.status = cpz.Status.finished;
      await this.broker.call(`${cpz.Service.DB_BACKTESTS}.upsert`, {
        entity: backtesterState
      });
      const duration = dayjs
        .utc(backtesterState.finishedAt)
        .diff(dayjs.utc(backtesterState.startedAt), "minute");

      this.logger.info(`Backtest finished after ${duration} minutes!`);
      this.broker.emit(`${cpz.Event.BACKTESTER_FINISHED}`, {
        id: backtesterState.id
      });
      if (backtesterState.settings.populateHistory)
        this.broker.emit(`${cpz.Event.BACKTESTER_FINISHED_HISTORY}`, {
          id: backtesterState.id
        });
      return { success: true, duration };
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
      if (backtesterState.settings.populateHistory)
        this.broker.emit(`${cpz.Event.BACKTESTER_FAILED_HISTORY}`, {
          id: backtesterState.id,
          error: e
        });
      return { success: false, error: e };
    }
  }
}

export = BacktesterWorkerService;
