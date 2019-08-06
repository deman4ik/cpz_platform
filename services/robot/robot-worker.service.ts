import { Service, ServiceBroker, Context } from "moleculer";
import { cpz } from "../../types/cpz";

class RobotWorkerService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.ROBOT_WORKER,
      actions: {
        create: {
          handler: this.create
        },
        execute: {
          handler: this.execute
        }
      }
    });
  }

  async create(ctx: Context) {}

  async execute(ctx: Context) {
    return true;
  }
}

export = RobotWorkerService;
