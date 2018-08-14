const LoadCandlesCC = require("./index");

const context = {
  log: console.log
};
test("return result", async () => {
  const input = {
    exchange: "Bitfinex",
    baseq: "BTC",
    quote: "USD",
    dateFrom: "2018-01-01T00:00:00Z",
    dateTo: "2018-01-02T00:00:00Z",
    timeframe: "1m",
    timeout: "100",
    proxy: "http://173.68.185.170:80"
  };
  const result = await LoadCandlesCC(context, input);
  expect(result).toBeDefined();
});
