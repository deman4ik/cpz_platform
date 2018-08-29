**CPZMarketWatcher** - модуль загрузки тиковых данных и свечей с бирж.
Управление производится через REST Api.
***
**POST** запрос запускает получение данных с конкретной биржи по конкретному инструменту.
Данные принимаются в формате `JSON`.
Структура принимаемого JSON объекта:
* `NameProvider`     - уникальное имя поставщика данных, если в модуле существует поставщик с таким именем, тогда запрос отдается ему, иначе создается новый поставщик с таким именем.
* `TypeDataProvider` - тип поставщика, на данном этапе только один - _cryptocompare_
* `Exchange` - биржа, с которой нужно получать текущий инструмент
* `Baseq` - базовая валюта
* `Quote` - котировка валюты 
* `ActionType` - тип запроса, Subscribe значит добавить подписку, Remove - удалить поставщика, Unsubscribe - удалить пару
* `Proxy` - адрес прокси сервера


Пример запроса: 
1) строка подключения:
http://localhost:50527/api/import

2) заголовки:      
 
         User-Agent: Fiddler
         Host: localhost:50527
         Content-Length: 224
         Content-Type: application/json
         Key: test

3) тело:

        {
        "nameProvider":"FirstCompare",
        "typeDataProvider":"CryptoCompare",
        "exchange": "Bitfinex",
        "baseq" : "BTC" ,
        "quote": "USD",
        "dateFrom": "2018-03-19T10:00:00Z",
        "dateTo": "2018-03-29T10:00:00Z",
        "timeframe": "5"
        }

**GET** запрос позволяет получить все запущенные поставщики и пары на них


**GET с параметром** возвращает данные о поставщике по его имени.

пример: `http://localhost:50527/api/import/<providerName>`
        
        
**Docker**

Сборка - `docker build -t cpz-marketwatcher .`
Запуск - `docker run -e API_KEY="SOME_API_KEY" -e EG_TOPIC_ENDPOINT="SOME_EG_ENDPOINT" -e EG_TOPIC_KEY="SOME_EG_TOPIC_KEY" -p 80:80 cpz-marketwatcher`
