#Start Candlebatcher
POST http://localhost:7071/api/funcTaskEvents
[{
  "data": {
  	  "taskId": "test170918_1500",
      "mode": "emulator",
      "debug": true,
      "providerType": "cryptocompare",
      "exchange": "bitfinex",
      "asset": "BTC",
      "currency": "USD",
      "timeframes":[1,5,60]
    },
  "eventType": "CPZ.Tasks.Candlebatcher.Start",
  "subject":"bitfinex/BTC/USD/[5,60]/test170918_1500.E"
}]

#Stop Candlebatcher
POST http://localhost:7071/api/funcTaskEvents
[{
  "data": {
  	  "taskId": "test170918_1500",
      "rowKey": "test170918_1500",
      "partitionKey":"bitfinex.BTC.USD"
    },
  "eventType": "CPZ.Tasks.Candlebatcher.Stop",
  "subject":"bitfinex/BTC/USD/[5,60]/test170918_1500.E"
}]

#Update Candlebatcher
[{
  "data": {
  	  "taskId": "test170918_1500",
      "rowKey": "test170918_1500",
      "partitionKey":"bitfinex.BTC.USD",
      "debug":"true",
      "timeframes":[1]
    },
  "eventType": "CPZ.Tasks.Candlebatcher.Update",
  "subject":"bitfinex/BTC/USD/[1]/test170918_1500.E"
}]

#Start Import
[{
  "data": {
  	  "taskId": "test180918_0200",
      "mode": "emulator",
      "debug": true,
      "providerType": "ccxt",
      "exchange": "bitfinex",
      "asset": "BTC",
      "currency": "USD",
      "timeframe": 1,
      "limit":500,
      "dateFrom":"2018-09-18T00:00:00.000Z",
      "dateTo":"2018-09-18T15:00:00.000Z"
    },
  "eventType": "CPZ.Tasks.Candlebatcher.StartImport",
  "subject":"bitfinex/BTC/USD/[5,60]/test170918_1500.E"
}]