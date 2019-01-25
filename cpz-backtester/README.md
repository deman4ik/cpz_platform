```javascript
npm i -g webpack
npm install
```

```javascript
webpack --watch
```

```javascript
npm run dev
```

### Start
POST - http://localhost:8108/api/taskEvents/?api-key=test
```javascript
[{
  "id": "968a8f13-bd77-40d8-ba83-5cf4364ec2a9",
  "topic": "/subscriptions/785b39f5-bf28-45bd-b2a3-65beea8e153e/resourceGroups/cpz/providers/Microsoft.EventGrid/topics/cpz-test-topic",
  "subject":"bitfinex/BTC/USD/1/UUID.B",
  "data": {
  	  "taskId": "UUID",
  	  "robotId": 1,
  	  "userId": "UUID",
  	  "strategyName":"STR_ROBOT_1",
      "exchange": "bitfinex",
      "asset": "BTC",
      "currency": "USD",
      "timeframe": 1,
      "dateFrom": "2018-12-10T00:00:00.000Z",
      "dateTo": "2018-12-10T01:00:00.000Z",
      "settings": {
      "debug": true
      },
      "adviserSettings": {
       "debug": false,
       "requiredHistoryCache": true,
       "requiredHistoryMaxBars": 10
      },
      "traderSettings": {
       "debug": false,
       "slippageStep": 1000,
       "deviation": 10,
       "volume": 1
      }
    },
  "eventType": "CPZ.Tasks.Backtester.Start",
  "eventTime": "2018-10-09T15:12:33.859Z",
  "metadataVersion": "1",
  "dataVersion": "1.0"
}]
```