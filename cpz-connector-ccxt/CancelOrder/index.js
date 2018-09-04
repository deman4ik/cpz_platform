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
    // инструмент, ордер которого нужно отменить
    let symbol = signal.Baseq + "/" + signal.Quote;

    try {
        // отправляем ордер на биржу
        const response = await exchange.cancelOrder (orderId, symbol);
        console.log (response);
        console.log ('Succeeded');

        let canceledOrder = new Object();

        canceledOrder.numberInSystem = response.id;
        canceledOrder.symbol = response.symbol;
        
        context.res = {
            status: 200,
            body: canceledOrder
        };     
    }
    catch (e) {

        let errorInfo = new Object();
        // орден не найден
        if(e.constructor.name == "OrderNotFound"){

            errorInfo.code = 400;

            errorInfo.message = "Ошибка снятия, ордер уже отменен или исполнен";

            context.res = {
                status: 200,
                body: errorInfo
            }; 
        } 
        else if(e.constructor.name == "NetworkError")
        {
            errorInfo.code = 410;

            errorInfo.message = "Не удалось отменить ордер, ошибка сети";
            // TO DO: повторная попытка отмены ордера
            context.res = {
                status: 200,
                body: errorInfo
            };             
        }              
    } 
};