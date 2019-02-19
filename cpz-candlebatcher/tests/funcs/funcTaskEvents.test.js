import FuncTaskEvents from "../../src/funcs/funcTaskEvents";

describe("FuncTaskEvents Tests", () => {
  test("Should be instance of CandleBatcher", () => {
    const candlebatcher = new FuncTaskEvents();
    expect(candlebatcher).toBeInstanceOf(FuncTaskEvents);
  });
});
