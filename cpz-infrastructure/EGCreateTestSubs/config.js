module.exports = {
  adviser: {
    name: "CPZ-Adviser",
    url: "/adviser/api/EventHandler",
    types: ["CPZ.Tasks.Adviser.Start", "CPZ.Candles.NewCandle"]
  },
  marketWatcher: {
    name: "CPZ-MarketWatcher",
    url: "/marketWatcher/api/EventHandler",
    types: ["CPZ.Tasks.MarketWatcher.Subscribe"]
  }
};
