const ccxt = require("ccxt");

async function SetOrder(context, req) {
  const tradeInfo = req.body;

  const clientInfo = tradeInfo.Item1;

  const signal = tradeInfo.Item2;

  // получаем имя нужной биржи из запроса
  const needExchangeName = signal.Exchange.toLowerCase();

  // подключаемся к ней
  const exchange = new ccxt[needExchangeName]({
    apiKey: clientInfo.TradeSettings.PublicKey,
    secret: clientInfo.TradeSettings.PrivateKey,
    timeout: 30000,
    enableRateLimit: true
  });

  // бумага для ордера
  const symbol = `${signal.Baseq}/${signal.Quote}`;
  // тип ордера
  const orderType = signal.Type === 0 ? "limit" : "market";
  // направление сделки
  const side = signal.Direction;
  // объем
  const amount = clientInfo.TradeSettings.Volume;
  // цена для ордера
  const price = signal.Price;

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
  }
}

module.exports = SetOrder;
