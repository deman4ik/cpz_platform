**CPZMarketWatcher** - модуль загрузки тиковых данных и свечей с бирж.
Управление производится через REST Api.
***
**POST** запрос запускает получение данных с конкретной биржи по конкретному инструменту.
Данные принимаются в формате `JSON`.
Структура принимаемого JSON объекта:
* `nameProvider`     - уникальное имя поставщика данных, если в модуле существует поставщик с таким именем, тогда запрос отдается ему, иначе создается новый поставщик с таким именем.
* `typeDataProvider` - тип поставщика, на данном этапе только один - _cryptocompare_
* `exchange` - биржа, с которой нужно получать текущий инструмент
* `asset` - базовая валюта
* `currency` - котировка валюты 
* `actionType` - тип запроса, Subscribe значит добавить подписку, Remove - удалить поставщика, Unsubscribe - удалить пару
* `proxy` - адрес прокси сервера


Пример запроса: 
1) строка подключения:
http://localhost:50527/api/taskEvents

`CPZ.Tasks.MarketWatcher.Start` - создает нового поставщика



2) заголовки:      
 
         User-Agent: Fiddler
         Host: localhost:50527
         Content-Length: 224
         Content-Type: application/json
         Key: test

3) тело:

       [{
         "id": "2d1781af-3a4c-4d7c-bd0c-e34b19da4e19",
         "topic": "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
          "subject": "testSub",
          "data": {
           "taskId": "FirstProvider",
           "mode": "emulator",        
           "exchange": "bitmex",
           "asset": "BTC",
           "currency":"ETH",    
           "debug":"true",
           "providerType": "CryptoCompare"
           },
         "eventType": "CPZ.Tasks.MarketWatcher.Start"
       }]

`CPZ.Tasks.MarketWatcher.Subscribe` - подписка на новый инструмент

`CPZ.Tasks.MarketWatcher.Unsubscribe` - отписаться от получения данных по инструменту

`CPZ.Tasks.MarketWatcher.Stop` - остановить поставщика


http://localhost:50527/api/status

**GET** запрос позволяет получить все запущенные поставщики и пары на них


**GET с параметром** возвращает данные о поставщике по его имени.

пример: `http://localhost:50527/api/status/<providerName>`
        
        
**Docker**

Сборка - `docker build -t cpz-marketwatcher .`
Запуск - `docker run -e API_KEY="SOME_API_KEY" -e EG_TOPIC_ENDPOINT="SOME_EG_ENDPOINT" -e EG_TOPIC_KEY="SOME_EG_TOPIC_KEY" -p 80:80 cpz-marketwatcher`
