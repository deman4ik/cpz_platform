module.exports = async function (context, req) {
   
    const ccxt = require('ccxt');

    let tradeInfo = req.body;
  
    let clientInfo = tradeInfo.Item2;

    let signal = tradeInfo.Item3;

    // ID ордера для отмены
    let orderId = tradeInfo.Item1;

    // получаем имя нужной биржи из запроса
    let needExchangeName = signal.Exchange.toLowerCase();
 
    // подключаемся к ней
    let exchange = new ccxt[needExchangeName] (
        {
            'apiKey': clientInfo.TradeSettings.PublicKey,
            'secret': clientInfo.TradeSettings.PrivateKey,
            'timeout': 30000,
            'enableRateLimit': true,
        }
    );
    // инструмент, ордер которого нужно проверить
    let symbol = signal.Baseq + "/" + signal.Quote;

    try {
        // запрашиваем информацию по ордеру
        const response = await exchange.fetchOrder (orderId, symbol);
        
        let orderInfo = new Object();
        
        orderInfo.symbol = response.symbol;
        orderInfo.volume = response.amount;
        orderInfo.price = response.price;
        orderInfo.time = response.datetime;
        orderInfo.state = response.status;
        orderInfo.ordertype = response.type;
        orderInfo.numberInSystem = response.id;
        order.executed = response.amount - response.remaining;

        context.res = {
            status: 200,
            body: orderInfo
        };     
    }catch(e)
    {
        let errorInfo = new Object();
        
        if(e.constructor.name == "NotSupported"){

            errorInfo.code = 500;

            errorInfo.message = "Данная биржа не поддерживает проверку";

            context.res = {
                status: 200,
                body: errorInfo
            }; 
        }        
    }
};