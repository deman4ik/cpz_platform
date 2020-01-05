import { addPercent } from "../../utils/helpers";

describe("Test 'helper' utils", () => {
  describe("Test 'addPercent'", () => {
    it("Should return correct value for positive percent", () => {
      const result = addPercent(100, 10);
      expect(result).toBe(110);
    });
    it("Should return correct value for negative percent", () => {
      const result = addPercent(100, -10);
      expect(result).toBe(90);
    });
  });
});
