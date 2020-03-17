import { calcStatistics } from "../../utils/tradeStatistics";
import { positions } from "../testData/positionsForStats";

describe("Test 'tradeStatistics' utils", () => {
  describe("Test 'calcStatistics'", () => {
    it("Should calc stats", () => {
      const result = calcStatistics(positions);
      console.log(result);
      expect(result).toBeTruthy();
    });
  });
});
