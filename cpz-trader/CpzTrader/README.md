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

Для запуска проторговщиков необходимо отправиль сигнал с типом события `CPZ.Tasks.Trader.Start` который содержит имя робота.

Шаблон тела запроса:

```
[{
  "id": "2d1781af-3a4c-4d7c-bd0c-e34b19da4e19",
  "topic": "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "subject": "",
  "data": {
    "AdvisorName": "PriceChanell_1H"    
  },
  "eventType": "CPZ.Tasks.Trader.Start",
  "eventTime": "2018-08-17T20:12:19.4556811Z",
  "metadataVersion": "1",
  "dataVersion": "1"
}]
```

Далее трейдер готов к приему торговых сигналов, для этого отправляем событие 

`CPZ.Signals.NewSignal` - для использования устойчивых функций


```
[{
  "data": {
    "AdvisorName": "PriceChanell_1H",
    "Action": "NewPosition",
    "Price": 100, 
    "Type": "limit",   
    "Direction": "buy",
    "Exchange": "Binance",
    "Baseq": "BTC",
    "Quote": "USD",
    "NumberOrderInRobot":"111",  
    "NumberPositionInRobot":"1",
    "PercentVolume":0
  },
  "eventType": "CPZ.Signals.NewSignal"
}]
```

или `noDurable` - для обычных функций

```
[{
  "data": {
    "AdvisorName": "PriceChanell_1H",
    "Action": "NewPosition",
    "Price": 100, 
    "Type": "market",   
    "Direction": "buy",
    "Exchange": "Binance",
    "Baseq": "BTC",
    "Quote": "USD",
    "NumberOrderInRobot":"111",  
    "NumberPositionInRobot":"1",
    "PercentVolume":0
  },
  "eventType": "noDurable"
}]
```

Поле `AdvisorName` содержит имя робота от которого пришел сигнал

`Action` - тип сигнала, их несколько

1. `NewPosition` - сигнализирует об открытии новой позиции и первого открывающего ордера,
  данные пришедшие в этом событии должны содержать уникальный номер позиции в системе в поле `NumberPositionInRobot`.
 
2. `NewOpenOrder` - новый ордер, который доливает объем в уже имеющуяся позицию, в поле `NumberPositionInRobot` указывается номер позиции
   в которую нужно долиться.
3. `NewCloseOrder` - новый ордер, который либо закрывает позицию полностью, либо сокращает ее объем. Если 
    поле `PercentVolume` равно 100, значит нужно полностью закрыть позицию, иначе закрыть только часть равную `PercentVolume`
в процентах от открытого объема. Так же не забываем указать номер позиции которую обрабатываем этим сигналом.
4. `CancelOrder` - отозвать ордер
5. `CheckOrder` - проверить ордер на бирже в случае реальной торговли, либо изменить состояние ордера с "activ" на "done"
   в случае эмуляции.

`Type` - по умолчанию "limit", при необходимости "market"

`Direction` - направление сделки "buy" или "sell"

`NumberOrderInRobot` - номер ордера в роботе

`NumberPositionInRobot` - номер позиции в роботе

`PercentVolume` - объем для закрытия в процентах