const ccxt = require("ccxt");

async function CheckOrder(context, req) {
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
  // инструмент, ордер которого нужно проверить
  const symbol = `${signal.Baseq}/${signal.Quote}`;

  try {
    // запрашиваем информацию по ордеру
    const response = await exchange.fetchOrder(orderId, symbol);

    const orderInfo = {
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
      body: orderInfo
    };
  } catch (e) {
    const errorInfo = {};

    if (e.constructor.name === "NotSupported") {
      errorInfo.code = 500;

      errorInfo.message = "Данная биржа не поддерживает проверку";

      context.res = {
        status: 200,
        body: errorInfo
      };
    }
  }
}

module.exports = CheckOrder;
