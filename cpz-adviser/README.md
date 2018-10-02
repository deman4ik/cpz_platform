#Start Adviser
POST /api/taskEvents
[{
  "data": {
  	  "taskId": "test240918",
      "robotId": "robot_1",
      "mode": "emulator",
      "debug": true,
      "strategyName": "STR_ROBOT_1",
      "exchange": "bitfinex",
      "asset": "BTC",
      "currency": "USD",
      "timeframe": 1
    },
  "eventType": "CPZ.Tasks.Adviser.Start",
  "subject":"bitfinex/BTC/USD/1/robot_1/test240918.E"
}]

#Stop Adviser
POST /api/taskEvents
[{
  "data": {
  	  "taskId": "test240918",
      "rowKey": "test240918",
      "partitionKey": "bitfinex.BTC.USD"
    },
  "eventType": "CPZ.Tasks.Adviser.Stop",
  "subject":"bitfinex/BTC/USD/1/robot_1/test240918.E"
}]

#Update Adviser
POST /api/taskEvents
[{
  "data": {
  	  "taskId": "test240918",
      "rowKey": "test240918",
      "partitionKey": "bitfinex.BTC.USD",
      "debug": false
    },
  "eventType": "CPZ.Tasks.Candlebatcher.Update",
  "subject":"bitfinex/BTC/USD/1/robot_1/test240918.E"
}]