**CpzTrader** - модуль получает сигналы от советника и исполняет их для клиентов, оформивших подписку на этого советника.

При публикации событий через EventGrid сначала нужно отправить сообщение валидации

```
[{
  "data": {
    "validationCode": "512d38b6-c7b8-40c8-89fe-f46f9e9622b6",
    "validationUrl": "https://rp-eastus2.eventgrid.azure.net:553/eventsubscriptions/estest/validate?id=B2E34264-7D71-453A-B5FB-B62D0FDC85EE&t=2018-04-26T20:30:54.4538837Z&apiVersion=2018-05-01-preview&token=1BNqCxBBSSE9OnNSfZM4%2b5H9zDegKMY6uJ%2fO2DFRkwQ%3d"
  },
  "eventType": "Microsoft.EventGrid.SubscriptionValidationEvent"
}]
```

При тестировании через фидлер или постман первый шаг можно пропустить.

Для подключения клиента к советнику нужно отправить событие с типом `CPZ.Tasks.Trader.Start` которое содержит данные клиента.

Шаблон тела запроса:

```
[{
"id": "2d1781af-3a4c-4d7c-bd0c-e34b19da4e19",
  "topic": "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "subject": "testSub",
  "data": {
    "userId":"Ivanov",
    "taskId": "ClientNumberOne",
    "robotId": "TestRobot",
    "mode": "emulator",        
    "timeframe": 5,
    "exchange": "binance",
    "asset": "XRP",
    "currency":"ETH",    
    "debug":"true",
    "settings": {
       "slippageStep": 20,
       "volume": 12,
       "deviation":10
    }    
   },
  "eventType": "CPZ.Tasks.Trader.Start"
}]
```

`CPZ.Tasks.Trader.Stop` - остановить клиента

```
[{
"id": "2d1781af-3a4c-4d7c-bd0c-e34b19da4e19",
  "topic": "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "subject": "testSub",
  "data": {
    "taskId": "ClientNumberOne",
    "robotId": "TestRobot",    
   },
  "eventType": "CPZ.Tasks.Trader.Stop"
}]
```

`CPZ.Tasks.Trader.Update` - обновить инфо о клиенте


 

`CPZ.Signals.NewSignal` - новый сигнал от советника

```
[{
  "data": {
    "alertTime":"2018-03-19T10:00:00Z",
    "robotId": "TestRobot",
    "action": "Long",
    "price": 9000, 
    "orderType": "stop",      
    "id":"111",  
    "positionId":"num1"
  },
  "eventType": "CPZ.Signals.NewSignal"
}]
```

`CPZ.Trader.NewTick` - событие нового тика
```
[{
  "data": {
    "price": 9995, 
    "exchange": "binance",   
    "baseq": "XRP",    
    "quote":"ETH"
  },
  "eventType": "CPZ.Trader.NewTick"
}]
```


