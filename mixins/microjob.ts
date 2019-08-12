import { ServiceSchema } from "moleculer";
import { start, job, stop } from "microjob";

const Microjob: ServiceSchema = {
  name: "",
  settings: {
    maxWorkers: 9
  },
  async started() {
    await start({ maxWorkers: this.settings.maxWorkers });
  },
  async stopped() {
    await stop();
  },
  methods: {
    async executeInThread(func: (...args: any[]) => any, ...args: any[]) {
      return await job(
        async (data: any[]) => {
          try {
            const result = await func(...data);
            return { success: true, result };
          } catch (e) {
            return { success: false, result: null, error: e };
          }
        },
        {
          data: args,
          ctx: {
            func
          }
        }
      );
    }
  }
};

export = Microjob;
