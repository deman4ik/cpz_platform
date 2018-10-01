const ccxt = require("ccxt");

const HttpsProxyAgent = require("https-proxy-agent");

const validator = require("../utils/validator");

async function SetOrder(context, req) {
  
  const signal = req.body;
  
  var validationResult = validator(signal);

  if(validationResult === true)
  {
    // получаем имя нужной биржи из запроса
    const needExchangeName = signal.exchange.toLowerCase();

    const proxy = signal.proxy || process.env.PROXY_ENDPOINT;
  
    let agent;

    if (proxy) {
      agent = new HttpsProxyAgent(proxy);
    }
  
    // подключаемся к ней
    const exchange = new ccxt[needExchangeName]({
      apiKey: signal.publicKey,
      secret: signal.privateKey,
      agent: agent
    });

    // бумага для ордера
    const symbol = `${signal.asset}/${signal.currency}`;
    // тип ордера, по факту всегда "limit"
    const orderType = signal.type; 
    // направление сделки
    const side = signal.direction;
    // объем
    const amount = signal.volume;
    // цена для ордера
    const price = signal.price;

    try {
      // отправляем ордер на биржу
      const response = await exchange.createOrder(
        symbol,
        orderType,
        side,
        amount,
        price
      );
  
      const order = {
        symbol: response.symbol,
        volume: response.amount,
        price: response.price,
        time: response.datetime,
        state: response.status,
        ordertype: response.type,
        numberInSystem: response.id,
        executed: response.amount - response.remaining
      };
  
      context.res = {
        status: 200,
        body: order
      };
    } catch (e) {
      const errorInfo = {};
      // биржа вернула ошибку аутентификации
      if (e.constructor.name === "AuthenticationError") {
        errorInfo.code = 100;
  
        errorInfo.message = "Ошибка аутентификации";
  
        context.res = {
          status: 500,
          body: errorInfo
        };
      } // нехватка средств для выставления ордера
      else if (e.constructor.name === "InsufficientFunds") {
        errorInfo.code = 110;
  
        errorInfo.message = "Не достаточно средств для выставления ордера";
  
        context.res = {
          status: 500,
          body: errorInfo
        };
      } // ошибка в параметрах ордера
      else if (e.constructor.name === "InvalidOrder") {
        errorInfo.code = 120;
  
        errorInfo.message = "Ошибка в параметрах ордера";
  
        context.res = {
          status: 500,
          body: errorInfo
        };
      }
      else{
        
      }
    }
  }
}

module.exports = SetOrder;
