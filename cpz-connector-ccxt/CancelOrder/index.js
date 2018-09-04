const ccxt = require("ccxt");

async function CancelOrder(context, req) {
  const tradeInfo = req.body;

  const clientInfo = tradeInfo.Item2;

  const signal = tradeInfo.Item3;

  // ID ордера для отмены
  const orderId = tradeInfo.Item1;

  // получаем имя нужной биржи из запроса
  const needExchangeName = signal.Exchange.toLowerCase();

  // подключаемся к ней
  const exchange = new ccxt[needExchangeName]({
    apiKey: clientInfo.TradeSettings.PublicKey,
    secret: clientInfo.TradeSettings.PrivateKey,
    timeout: 30000,
    enableRateLimit: true
  });
  // инструмент, ордер которого нужно отменить
  const symbol = `${signal.Baseq}/${signal.Quote}`;

  try {
    // отправляем ордер на биржу
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
