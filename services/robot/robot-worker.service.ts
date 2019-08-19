import { Service, ServiceBroker, Context } from "moleculer";
import QueueService from "moleculer-bull";
import { Job } from "bull";
import { cpz } from "../../types/cpz";
import Robot from "../../state/robot/robot";
import { combineRobotSettings } from "../../state/settings";
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
        `${cpz.Service.DB_ROBOT_POSITIONS}`
      ],
      mixins: [
        QueueService(process.env.REDIS_URL, {
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

            return { success: true };
          }
        }
      },
      started: this.startedService
    });
  }

  async startedService() {
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
    if (process.env.LOCAL_CODE_FILES) {
      this.logger.warn("Loading local strategy and indicators files");
      strategies.forEach(async ({ id }) => {
        this._strategiesCode[id] = await import(`../../strategies/${id}`);
      });
      baseIndicators.forEach(async ({ id }) => {
        this._baseIndicatorsCode[id] = await import(`../../indicators/${id}`);
      });
    } else {
      strategies.forEach(({ id, file }) => {
        this._strategiesCode[id] = requireFromString(file);
      });
      baseIndicators.forEach(async ({ id, file }) => {
        this._baseIndicatorsCode[id] = requireFromString(file);
      });
    }
  }

  async start(ctx: Context) {
    const { id } = ctx.params;
    const robotState: cpz.RobotState = await this.broker.call(
      `${cpz.Service.DB_ROBOTS}.get`,
      { id }
    );
    if (!robotState) throw new Error(`Robot ${id} not found.`);
    const { status, settings } = robotState;
    if (status === cpz.Status.starting) {
      const robot = new Robot({
        ...robotState,
        settings: combineRobotSettings(settings)
      });
    }
    return { id, status };
  }
}

export = RobotWorkerService;
