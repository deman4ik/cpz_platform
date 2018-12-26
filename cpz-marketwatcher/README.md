### Start

```javascript
[{
  "id": "968a8f13-bd77-40d8-ba83-5cf4364ec2a9",
  "topic": "/subscriptions/785b39f5-bf28-45bd-b2a3-65beea8e153e/resourceGroups/cpz/providers/Microsoft.EventGrid/topics/cpz-test-topic",
  "subject":"host1.marketwatcher1.E",
  "data": {
  	  "taskId": "marketwatcher1",
  	  "mode": "emulator",
      "debug": true,
      "providerType": "cryptocompare",
      "exchange":"bitfinex",
      "subscriptions": [{"asset":"BTC","currency":"USD"}]
    },
  "eventType": "CPZ.Tasks.Marketwatcher.Start",
  "eventTime": "2018-10-09T15:12:33.859Z",
  "metadataVersion": "1",
  "dataVersion": "1.0"
}]
```

### Stop

```javascript
[{
  "id": "968a8f13-bd77-40d8-ba83-5cf4364ec2a9",
  "topic": "/subscriptions/785b39f5-bf28-45bd-b2a3-65beea8e153e/resourceGroups/cpz/providers/Microsoft.EventGrid/topics/cpz-test-topic",
  "subject":"host1.marketwatcher1.E",
  "data": {
  	  "taskId": "marketwatcher1"
    },
  "eventType": "CPZ.Tasks.Marketwatcher.Stop",
  "eventTime": "2018-10-09T15:12:33.859Z",
  "metadataVersion": "1",
  "dataVersion": "1.0"
}]
```

### Subscribe

```javascript
[{
  "id": "968a8f13-bd77-40d8-ba83-5cf4364ec2a9",
  "topic": "/subscriptions/785b39f5-bf28-45bd-b2a3-65beea8e153e/resourceGroups/cpz/providers/Microsoft.EventGrid/topics/cpz-test-topic",
  "subject":"host1.marketwatcher1.E",
  "data": {
      "taskId": "marketwatcher1",
      "exchange":"bitfinex"
      "subscriptions": [{"asset":"BTC","currency":"USD"}]
    },
  "eventType": "CPZ.Tasks.Marketwatcher.Subscribe",
  "eventTime": "2018-10-09T15:12:33.859Z",
  "metadataVersion": "1",
  "dataVersion": "1.0"
}]
```

### Unsubscribe

```javascript
[{
  "id": "968a8f13-bd77-40d8-ba83-5cf4364ec2a9",
  "topic": "/subscriptions/785b39f5-bf28-45bd-b2a3-65beea8e153e/resourceGroups/cpz/providers/Microsoft.EventGrid/topics/cpz-test-topic",
  "subject":"host1.marketwatcher1.E",
  "data": {
      "taskId": "marketwatcher1",
      "exchange":"bitfinex"
      "subscriptions": [{"asset":"BTC","currency":"USD"}]
    },
  "eventType": "CPZ.Tasks.Marketwatcher.Unsubscribe",
  "eventTime": "2018-10-09T15:12:33.859Z",
  "metadataVersion": "1",
  "dataVersion": "1.0"
}]
```