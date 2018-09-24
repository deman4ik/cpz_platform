const ccxt = require("ccxt");

async function CheckOrder(context, req) {
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
