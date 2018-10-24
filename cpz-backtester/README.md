### Start

```javascript
[{
  "id": "968a8f13-bd77-40d8-ba83-5cf4364ec2a9",
  "topic": "/subscriptions/785b39f5-bf28-45bd-b2a3-65beea8e153e/resourceGroups/cpz/providers/Microsoft.EventGrid/topics/cpz-test-topic",
  "subject":"bitfinex/BTC/USD/1/backtest1.B",
  "data": {
  	  "taskId": "backtest1",
  	  "robotId": "robot1",
  	  "userId": "SYSTEM_USER_1",
  	  "adviserId": "backtest1",
      "debug": true,
      "strategyName":"STR_ROBOT_1",
      "exchange": "bitfinex",
      "exchangeId": 1,
      "asset": "BTC",
      "currency": "USD",
      "timeframe": 1,
      "slippageStep": 1000,
      "deviation": 10,
      "volume": 1,
      "dateFrom": "2018-03-01T00:00:00.000Z",
      "dateTo": "2018-03-01T00:05:00.000Z",
      "requiredHistoryCache": true,
      "requiredHistoryMaxBars": 10
    },
  "eventType": "CPZ.Tasks.Backtester.Start",
  "eventTime": "2018-10-09T15:12:33.859Z",
  "metadataVersion": "1",
  "dataVersion": "1.0"
}]
```