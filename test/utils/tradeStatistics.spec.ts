import { calcStatistics } from "../../utils/tradeStatistics";
import { cpz } from "../../@types";

const positions: cpz.RobotPositionState[] = [
  {
    id: "baaf50a2-e3e0-4673-9826-9be7ecedf046",
    robotId: "31556072-0379-486b-9feb-3e2539ff01e2",
    timeframe: 1,
    volume: 0.1,
    prefix: "p",
    code: "p_1",
    parentId: undefined,
    direction: cpz.PositionDirection.long,
    status: cpz.RobotPositionStatus.closed,
    entryStatus: cpz.RobotTradeStatus.closed,
    entryPrice: 9594.4,
    entryDate: "2019-08-30T14:30:33.392Z",
    entryOrderType: cpz.OrderType.stop,
    entryAction: cpz.TradeAction.long,
    entryCandleTimestamp: "2019-08-03T18:37:00.000Z",
    exitStatus: cpz.RobotTradeStatus.closed,
    exitPrice: 9599.8,
    exitDate: "2019-08-30T14:40:04.086Z",
    exitOrderType: cpz.OrderType.stop,
    exitAction: cpz.TradeAction.closeLong,
    exitCandleTimestamp: "2019-08-03T18:37:00.000Z",
    alerts: {},
    profit: 5.399999999999636,
    barsHeld: 0
  }
];
describe("Test 'tradeStatistics' utils", () => {
  describe("Test 'calcStatistics'", () => {
    it("Should calc stats", () => {
      const result = calcStatistics(positions);
      console.log(result);
      expect(result).toBeTruthy();
    });
  });
});
