import { Service, ServiceBroker, Context } from "moleculer";
import QueueService from "moleculer-bull";
import { Job } from "bull";
import { cpz } from "../../types/cpz";
import Robot from "../../state/robot/robot";
import { sortAsc } from "../../utils";
import { v4 as uuid } from "uuid";
import { Op } from "sequelize";
import requireFromString from "require-from-string";

class RobotWorkerService extends Service {
  _strategiesCode: { [key: string]: any } = {};
  _baseIndicatorsCode: { [key: string]: any } = {};

  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.ROBOT_WORKER,
      dependencies: [
        `${cpz.Service.DB_STRATEGIES}`,
        `${cpz.Service.DB_ROBOTS}`,
        `${cpz.Service.DB_ROBOT_JOBS}`,
        `${cpz.Service.DB_ROBOT_POSITIONS}`,
        `${cpz.Service.DB_CANDLES}1`,
        `${cpz.Service.DB_CANDLES}5`,
        `${cpz.Service.DB_CANDLES}15`,
        `${cpz.Service.DB_CANDLES}30`,
        `${cpz.Service.DB_CANDLES}60`,
        `${cpz.Service.DB_CANDLES}120`,
        `${cpz.Service.DB_CANDLES}240`,
        `${cpz.Service.DB_CANDLES}1440`,
        `${cpz.Service.DB_CANDLES_CURRENT}`
      ],
      mixins: [
        QueueService({
          redis: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD,
            tls: true
          },
          settings: {
            lockDuration: 20000,
            lockRenewTime: 5000,
            stalledInterval: 30000,
            maxStalledCount: 1
          }
        })
      ],
      actions: {
        start: {
          params: {
            id: "string"
          },
          handler: this.start
        }
      },
      queues: {
        [cpz.Queue.runRobot]: {
          concurrency: 100,
          async process(job: Job) {
            this.logger.info(`Running robot ${job.id}`);
            await this.processJobs(job.id);
            return { success: true, id: job.id };
          }
        }
      },
      events: {
        [cpz.Event.ROBOT_WORKER_RELOAD_CODE]: this.loadCode
      },
      started: this.startedService
    });
  }

  async loadCode() {
    const strategies: cpz.CodeFilesInDB[] = await this.broker.call(
      `${cpz.Service.DB_STRATEGIES}.find`,
      {
        available: {
          [Op.gte]: 5
        }
      }
    );
    const baseIndicators: cpz.CodeFilesInDB[] = await this.broker.call(
      `${cpz.Service.DB_INDICATORS}.find`,
      {
        available: {
          [Op.gte]: 5
        }
      }
    );
    if (process.env.CODE_FILES_LOCATION === "local") {
      this.logger.warn("Loading local strategy and indicators files");
      strategies.forEach(async ({ id }) => {
        this._strategiesCode[id] = await import(`../../strategies/${id}`);
      });
      baseIndicators.forEach(async ({ id }) => {
        this._baseIndicatorsCode[id] = await import(`../../indicators/${id}`);
      });
    } else {
      this.logger.info("Loading remote strategy and indicator files");
      strategies.forEach(({ id, file }) => {
        this._strategiesCode[id] = requireFromString(file);
      });
      baseIndicators.forEach(async ({ id, file }) => {
        this._baseIndicatorsCode[id] = requireFromString(file);
      });
    }
    this.logger.info(
      `Loaded ${Object.keys(this._strategiesCode).length} strategies and ${
        Object.keys(this._baseIndicatorsCode).length
      } indicators`
    );
  }

  async startedService() {
    await this.loadCode();
  }

  async start(ctx: Context) {
    const { id } = ctx.params;
    this.logger.info(`Robot #${id} starting...`);
    await this.run({ id: uuid(), robotId: id, type: cpz.RobotJobType.start });
  }

  async processJobs(robotId: string) {
    try {
      this.logger.info(`Robot #${robotId} started processing jobs`);
      let [nextJob]: cpz.RobotJob[] = await this.broker.call(
        `${cpz.Service.DB_ROBOT_JOBS}.find`,
        {
          limit: 1,
          sort: "created_at",
          query: {
            robotId
          }
        }
      );
      if (nextJob) {
        while (nextJob) {
          let status = await this.run(nextJob);
          await this.broker.call(`${cpz.Service.DB_ROBOT_JOBS}.remove`, {
            id: nextJob.id
          });
          if (status === cpz.Status.started) {
            [nextJob] = await this.broker.call(
              `${cpz.Service.DB_ROBOT_JOBS}.find`,
              {
                limit: 1,
                sort: "created_at",
                query: {
                  robotId
                }
              }
            );
          } else {
            nextJob = null;
          }
        }
      }
      this.logger.info(`Robot #${robotId} finished processing jobs`);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async run(job: cpz.RobotJob) {
    const { type, robotId, data } = job;
    this.logger.info(`Robot #${robotId} processing '${type}' job`);
    try {
      const robotState: cpz.RobotState = await this.broker.call(
        `${cpz.Service.DB_ROBOTS}.get`,
        { id: robotId }
      );
      if (!robotState) throw new Error(`Robot ${robotId} not found.`);
      const robot = new Robot(robotState);
      robot._log = this.logger.info.bind(this);
      if (type === cpz.RobotJobType.tick) {
        // New tick - checking alerts
        const [currentCandle]: cpz.Candle[] = await this.broker.call(
          `${cpz.Service.DB_CANDLES_CURRENT}.find`,
          {
            query: {
              exchange: robot.exchange,
              asset: robot.asset,
              currency: robot.currency,
              timeframe: robot.timeframe
            }
          }
        );
        robot.setStrategy(null);
        robot.handleCurrentCandle(currentCandle);

        robot.checkAlerts();
      } else if (type === cpz.RobotJobType.candle) {
        // New candle - running strategy
        robot.setStrategy(this._strategiesCode[robot.strategyName]);
        if (robot.hasBaseIndicators) {
          const baseIndicatorsCode = robot.baseIndicatorsFileNames.map(
            fileName => {
              return { fileName, code: this._baseIndicatorsCode[fileName] };
            }
          );
          robot.setBaseIndicatorsCode(baseIndicatorsCode);
        }
        robot.setIndicators();

        const requiredCandles: cpz.DBCandle[] = await this.broker.call(
          `${cpz.Service.DB_CANDLES}${robot.timeframe}.find`,
          {
            limit: robot.requiredHistoryMaxBars,
            sort: "-time",
            query: {
              exchange: robot.exchange,
              asset: robot.asset,
              currency: robot.currency
            }
          }
        );
        const historyCandles = requiredCandles
          .sort((a: cpz.DBCandle, b: cpz.DBCandle) => sortAsc(a.time, b.time))
          .map(candle => ({ ...candle, timeframe: robot.timeframe }));
        robot.handleHistoryCandles(historyCandles);
        robot.handleCandle(<cpz.Candle>data);
        await robot.calcIndicators();
        robot.runStrategy();
        robot.finalize();
      } else if (type === cpz.RobotJobType.start) {
        // Start robot - init strategy and indicators
        robot.clear();
        robot.setStrategy(this._strategiesCode[robot.strategyName]);
        robot.initStrategy();
        if (robot.hasBaseIndicators) {
          const baseIndicatorsCode = robot.baseIndicatorsFileNames.map(
            fileName => {
              return { fileName, code: this._baseIndicatorsCode[fileName] };
            }
          );
          robot.setBaseIndicatorsCode(baseIndicatorsCode);
        }
        robot.setIndicators();
        robot.initIndicators();
        robot.start();
      } else if (type === cpz.RobotJobType.stop) {
        // Stop robot
        robot.stop();
      } else if (type === cpz.RobotJobType.pause) {
        // Pause robot
        robot.pause();
      } else {
        throw new Error(`Unknown type "${type}"`);
      }

      // Saving robot positions
      if (robot.positionsToSave.length > 0) {
        await Promise.all(
          robot.positionsToSave.map(async position => {
            await this.broker.call(`${cpz.Service.DB_ROBOT_POSITIONS}.upsert`, {
              entity: position
            });
          })
        );

        if (
          robot.positionsToSave.filter(
            ({ status }) => status === cpz.RobotPositionStatus.closed
          ).length > 0
        ) {
          const allPositions = await this.broker.call(
            `${cpz.Service.DB_ROBOT_POSITIONS}.find`,
            {
              robotId: robot.id,
              status: cpz.RobotPositionStatus.closed
            }
          );
          robot.calcStats(allPositions);
        }
      }

      // Saving robot state
      await this.broker.call(`${cpz.Service.DB_ROBOTS}.upsert`, {
        entity: robot.state
      });
      // Sending robot events
      if (robot.eventsToSend.length > 0) {
        for (const { type, data } of robot.eventsToSend) {
          await this.broker.emit(type, data);
        }
      }

      return robot.status;
    } catch (e) {
      this.logger.error(e);
      await this.broker.emit(cpz.Event.ROBOT_FAILED, {
        eventType: cpz.Event.ROBOT_FAILED,
        robotId,
        jobType: type,
        error: e
      });
      throw e;
    }
  }
}

export = RobotWorkerService;
