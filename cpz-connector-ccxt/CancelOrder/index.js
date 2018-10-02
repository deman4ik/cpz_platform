const ccxt = require("ccxt");

const HttpsProxyAgent = require("https-proxy-agent");

const validator = require("../utils/validator");

async function CancelOrder(context, req) {

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

  // номер отменяемого ордера
  const orderId = signal.number;
  // бумага для ордера
  const symbol = `${signal.asset}/${signal.currency}`;

  try {
    // отправляем приказ на биржу
    const response = await exchange.cancelOrder(orderId, symbol);

    const canceledOrder = {
      numberInSystem: response.id,
      symbol: response.symbol
    };

    context.res = {
      status: 200,
      body: canceledOrder
    };
  } catch (e) {
    const errorInfo = {};
    // орден не найден
    if (e.constructor.name === "OrderNotFound") {
      errorInfo.code = 400;

      errorInfo.message = "Ошибка снятия, ордер уже отменен или исполнен";

      context.res = {
        status: 500,
        body: errorInfo
      };
    } else if (e.constructor.name === "NetworkError") {

      // отправляем приказ на биржу
      const response = await exchange.cancelOrder(orderId, symbol);

      const canceledOrder = {
        numberInSystem: response.id,
        symbol: response.symbol
      };

      context.res = {
        status: 200,
        body: canceledOrder
      };
      
      errorInfo.code = 410;

      errorInfo.message = "Не удалось отменить ордер, ошибка сети";
      // TO DO: повторная попытка отмены ордера
      context.res = {
        status: 500,
        body: errorInfo
      };
    }
    else{
      errorInfo.code = 430;
  
        errorInfo.message = "Неизвестная ошибка";

        errorInfo.details = e;
  
        context.res = {
          status: 500,
          body: errorInfo
        };
    }
  }
  }
}

module.exports = CancelOrder;
