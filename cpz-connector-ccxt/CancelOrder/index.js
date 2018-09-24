const ccxt = require("ccxt");

async function CancelOrder(context, req) {
  const signal = req.body;

  // получаем имя нужной биржи из запроса
  const needExchangeName = signal.exchange.toLowerCase();

  // подключаемся к ней
  const exchange = new ccxt[needExchangeName]({
    apiKey: signal.publicKey,
    secret: signal.privateKey,
    timeout: 30000,
    enableRateLimit: true
  });

  // номер отменяемого ордера
  const orderId = signal.number;
  // бумага для ордера
  const symbol = `${signal.asset}/${signal.currency}`;

  try {
    // отправляем приказ на биржу
    const response = await exchange.cancelOrder(orderId, symbol);
    console.log(response);
    console.log("Succeeded");

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
        status: 200,
        body: errorInfo
      };
    } else if (e.constructor.name === "NetworkError") {
      errorInfo.code = 410;

      errorInfo.message = "Не удалось отменить ордер, ошибка сети";
      // TO DO: повторная попытка отмены ордера
      context.res = {
        status: 200,
        body: errorInfo
      };
    }
  }
}

module.exports = CancelOrder;
