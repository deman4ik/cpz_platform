import { cpz } from "../../@types";
import UserRobot from "../../state/userRobot/userRobot";
import { v4 as uuid } from "uuid";
import dayjs from "../../lib/dayjs";

let robotId = uuid();
let userRobot: any;
describe("Test User Robot", () => {
  beforeEach(() => {
    userRobot = new UserRobot({
      id: uuid(),
      userExAccId: uuid(),
      robotId,
      settings: {
        volume: 1,
        kraken: {
          leverage: 2
        }
      },
      internalState: {},
      status: cpz.Status.started,
      startedAt: dayjs.utc("2019-10-25T00:00:00.000Z").toISOString(),
      robot: {
        exchange: "kraken",
        asset: "BTC",
        currency: "USD",
        timeframe: 5,
        tradeSettings: {
          slippage: {
            entry: {
              stepPercent: 10,
              count: 3
            },
            exit: {
              stepPercent: 10,
              count: 3
            }
          },
          deviation: {
            entry: 2,
            exit: 2
          },
          orderTimeout: 60000,
          multiPosition: false
        }
      },
      positions: []
    });
  });
  describe("Test handleSignal methods", () => {
    it("Schould create new Long Position", () => {
      const signal: cpz.SignalEvent = {
        id: uuid(),
        robotId,
        exchange: "kraken",
        asset: "BTC",
        currency: "USD",
        timeframe: 5,
        timestamp: dayjs.utc("2019-10-26T00:05:01.000Z").toISOString(),
        type: cpz.SignalType.trade,
        positionId: uuid(),
        positionPrefix: "p",
        positionCode: "p_1",
        candleTimestamp: dayjs.utc("2019-10-26T00:05:00.000Z").toISOString(),
        action: cpz.TradeAction.long,
        orderType: cpz.OrderType.stop,
        price: 6500
      };

      userRobot.handleSignal(signal);
      console.log(userRobot.state);
      expect(userRobot.state.positions.length).toBe(1);
    });
  });
});
