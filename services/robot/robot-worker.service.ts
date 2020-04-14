import { Service, ServiceBroker, Context } from "moleculer";
import QueueService from "moleculer-bull";
import { Job } from "bull";
import { cpz } from "../../@types";
import Robot from "../../state/robot/robot";
import { sortAsc } from "../../utils";
import { v4 as uuid } from "uuid";
import requireFromString from "require-from-string";

class RobotWorkerService extends Service {
  _strategiesCode: { [key: string]: any } = {};
  _baseIndicatorsCode: { [key: string]: any } = {};

  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.ROBOT_WORKER,
      dependencies: [
        cpz.Service.DB_STRATEGIES,
        cpz.Service.DB_ROBOTS,
        cpz.Service.DB_ROBOT_JOBS,
        cpz.Service.DB_ROBOT_POSITIONS,
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
      mixins: [
        QueueService({
          redis: {
            host: process.env.REDIS_HOST,
            port: +process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD,
            tls: process.env.REDIS_TLS && {}
          },
          settings: {
            lockDuration: 20000,
            lockRenewTime: 5000,
            stalledInterval: 30000,
            maxStalledCount: 10
          }
        })
      ],
      actions: {
        startUp: {
          params: {
            id: "string"
          },
          handler: this.startUp
        }
      },
      queues: {
        [cpz.Queue.runRobot]: {
          concurrency: 100,
          async process(job: Job) {
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
        query: {
          available: {
            $gte: 5
          }
        }
      }
    );
    const baseIndicators: cpz.CodeFilesInDB[] = await this.broker.call(
      `${cpz.Service.DB_INDICATORS}.find`,
      {
        query: {
          available: {
            $gte: 5
          }
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

  async startUp(ctx: Context<{ id: string }>) {
    const { id } = ctx.params;
    this.logger.info(`Robot #${id} starting...`);
    await this.run({ id: uuid(), robotId: id, type: cpz.RobotJobType.start });
  }

  async processJobs(robotId: string) {
    try {
      // this.logger.info(`Robot #${robotId} started processing jobs`);
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
          if (status) {
            try {
              await this.broker.call(`${cpz.Service.DB_ROBOT_JOBS}.remove`, {
                id: nextJob.id
              });
            } catch (e) {
              this.logger.warn(
                `Failed to delete robots #${robotId} job #${nextJob.id}`,
                e
              );
            }
            if (status !== cpz.Status.stopped && status !== cpz.Status.paused) {
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
          } else {
            nextJob = null;
          }
        }
      }
      //this.logger.info(`Robot #${robotId} finished processing jobs`);
    } catch (e) {
      this.logger.error(`Robot #${robotId} processing jobs error`, e);
      throw e;
    }
  }

  async run(job: cpz.RobotJob) {
    const { type, robotId, data, id } = job;
    //this.logger.info(`Robot #${robotId} processing '${type}' job #${id}`);
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
          `${cpz.Service.DB_CANDLES}${robot.timeframe}.find`,
          {
            sort: "-time",
            limit: 1,
            query: {
              exchange: robot.exchange,
              asset: robot.asset,
              currency: robot.currency
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
            (fileName) => {
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
            offset: 1,
            query: {
              exchange: robot.exchange,
              asset: robot.asset,
              currency: robot.currency
            }
          }
        );
        if (
          !requiredCandles ||
          !Array.isArray(requiredCandles) ||
          requiredCandles.length === 0
        ) {
          throw new Error("Failed to load candles");
        }
        const historyCandles = requiredCandles
          .sort((a: cpz.DBCandle, b: cpz.DBCandle) => sortAsc(a.time, b.time))
          .map((candle) => ({ ...candle, timeframe: robot.timeframe }));
        robot.handleHistoryCandles(historyCandles);
        const { success, error } = robot.handleCandle(<cpz.Candle>data);
        if (success) {
          await robot.calcIndicators();
          robot.runStrategy();
          robot.finalize();
        } else {
          this.logger.error(error);
        }
      } else if (type === cpz.RobotJobType.start) {
        // Start robot - init strategy and indicators
        robot.clear();
        robot.setStrategy(this._strategiesCode[robot.strategyName]);
        robot.initStrategy();
        if (robot.hasBaseIndicators) {
          const baseIndicatorsCode = robot.baseIndicatorsFileNames.map(
            (fileName) => {
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
        let averageFee: number;
        if (robot.hasClosedPositions) {
          const [market]: cpz.Market[] = await this.broker.call(
            `${cpz.Service.DB_MARKETS}.find`,
            {
              fields: ["averageFee"],
              query: {
                exchange: robot.exchange,
                asset: robot.asset,
                currency: robot.currency
              }
            }
          );
          this.logger.info(market);
          averageFee = market.averageFee;
        }

        await Promise.all(
          robot.positionsToSave.map(async (position) => {
            await this.broker.call(`${cpz.Service.DB_ROBOT_POSITIONS}.upsert`, {
              entity: {
                ...position,
                fee:
                  position.status === cpz.RobotPositionStatus.closed &&
                  averageFee
                    ? +averageFee
                    : null
              }
            });
          })
        );

        if (robot.hasClosedPositions) {
          this.logger.info(
            `Robot #${robot.id} has closed positions, sending ${cpz.Event.STATS_CALC_ROBOT} event.`
          );
          const { id } = robot.state;
          await this.broker.emit<cpz.StatsCalcRobotEvent>(
            cpz.Event.STATS_CALC_ROBOT,
            {
              robotId: id
            }
          );
        }
      }

      // Saving robot state
      await this.broker.call(`${cpz.Service.DB_ROBOTS}.update`, robot.state);
      // Sending robot events
      if (robot.eventsToSend.length > 0) {
        for (const { type, data } of robot.eventsToSend) {
          await this.broker.emit(type, data);
        }
      }

      return robot.status;
    } catch (e) {
      this.logger.error(
        `Robot #${robotId} processing ${type} job #${id} error`,
        e
      );
      await this.broker.emit(cpz.Event.ROBOT_FAILED, {
        robotId,
        jobType: type,
        error: e
      });
    }
  }
}

export = RobotWorkerService;
