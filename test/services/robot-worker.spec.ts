import { ServiceBroker, Errors } from "moleculer";
import TestService from "../../services/robot/robot-worker.service";
import { cpz } from "../../@types";

describe("Test 'robot-worker' service", () => {
  let broker = new ServiceBroker();
  broker.createService(TestService);

  beforeAll(() => broker.start());
  afterAll(() => broker.stop());

  describe("Test 'robot-worker.execute' action", () => {
    it("should execute strategy'", async () => {
      const result = await broker.call(`${cpz.Service.ROBOT_WORKER}.execute`);

      expect(result).toBeTruthy;
    });
  });
});
