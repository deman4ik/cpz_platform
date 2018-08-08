using CPZMarketWatcher.Models;
using Newtonsoft.Json;
using SuperSocket.ClientEngine;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Azure.EventGrid;
using Microsoft.Azure.EventGrid.Models;
using Newtonsoft.Json.Linq;
using WebSocket4Net;
using WebSocket = WebSocket4Net.WebSocket;
using WebSocketState = WebSocket4Net.WebSocketState;

namespace CPZMarketWatcher.DataProviders
{
    /// <summary>
    /// поставщик данных cryptocompare
    /// </summary>
    public class CryptoCompareProvider : AbstractDataProvider
    {
        public CryptoCompareProvider(string name) : base(name)
        {
            _tokenSource = new CancellationTokenSource();

            _token = _tokenSource.Token;

            _topicHostname = new Uri(_topicEndpoint).Host;

            // Формирование объекта прав доступа к сервису
            var topicCredentials = new TopicCredentials(_topicKey);

            _eventGridClient = new EventGridClient(topicCredentials);
        }

        private readonly CancellationTokenSource _tokenSource;

        private CancellationToken _token;

        private WebSocket _webSocket;

        /// <summary>
        /// список бумаг на которые уже подписаны
        /// </summary>
        public override List<OrderToProvider> SubscribedPairs { get; set; } = new List<OrderToProvider>();

        private Dictionary<string, CancellationTokenSource> _allTokenSources = new Dictionary<string, CancellationTokenSource>();

        /// <summary>
        /// проверить был ли такой запрос
        /// </summary>       
        /// <param name="newQuery">запрос на получение данных</param>
        /// <returns></returns>
        private bool CheckSubscription(OrderToProvider newQuery)
        {
            var needQuery = SubscribedPairs.Find(q =>
                q.Exchange == newQuery.Exchange &&
                q.Baseq == newQuery.Baseq &&
                q.Quote == newQuery.Quote);

            if (needQuery == null)
            {
                return false;
            }
            return true;
        }

        /// <summary>
        /// запустить получение данных
        /// </summary>
        /// <param name="subscribe"></param>
        public override async void StartReceivingData(OrderToProvider subscribe)
        {
            try
            {
                if (!CheckSubscription(subscribe))
                {
                    SubscribedPairs.Add(subscribe);
                    // генерируем строку подписки согласно полученному запросу
                    var queryStr = GenerateQueryStringTrades("SubAdd",subscribe.Exchange, subscribe.Baseq, subscribe.Quote);

                    // подписываемся
                    await SubscribeTrades(queryStr);

                    await StartCandleLoad(subscribe);
                }
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
                throw;
            }
        }

        /// <summary>
        /// остановить получение данных
        /// </summary>
        public override void StopReceivingData()
        {
            try
            {
                _tokenSource.Cancel();
                _tokenSource.Dispose();

                foreach (var cancellationTokenSource in _allTokenSources)
                {
                    cancellationTokenSource.Value.Cancel();
                    cancellationTokenSource.Value.Dispose();
                }

                SubscribedPairs.Clear();

                _allTokenSources.Clear();

                _webSocket.Dispose();

                _eventGridClient.Dispose();
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
                throw;
            }
        }

        /// <summary>
        /// переподключение
        /// </summary>
        public async void RestartReceivingData()
        {
            // генерируем строку переподключения
            var queryStr = GenerateQueryStringTrades(SubscribedPairs);

            try
            {
                await _webSocket.OpenAsync();

                if (_webSocket.State == WebSocketState.Open)
                {
                    _webSocket.Send(queryStr);
                }
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
                throw;
            }
        }

        private static readonly HttpClient client = new HttpClient();

        /// <summary>
        /// запустить получение свечек
        /// </summary>
        /// <param name="queryStr"></param>
        /// <returns></returns>
        private async Task StartCandleLoad(OrderToProvider queryStr)
        {
            try
            {
                // создаем новый токен отмены
                var tokenSource = new CancellationTokenSource();

                var token = tokenSource.Token;

                _allTokenSources.Add($"{queryStr.Exchange}_{queryStr.Baseq}_{queryStr.Quote}", tokenSource);

                // запускаем задачу по скачиванию свечей
                await Task.Run(async () =>
                {
                    int countNeedCandles = 10;

                    string exchange = queryStr.Exchange;

                    string baseq = queryStr.Baseq;

                    string quote = queryStr.Quote;

                    while (!token.IsCancellationRequested)
                    {
                        var url = $"https://min-api.cryptocompare.com/data/histominute?fsym={queryStr.Baseq}&tsym={queryStr.Quote}&limit={countNeedCandles}";

                        var stringCandles = await client.GetStringAsync(url);

                        //var candles = JsonConvert.DeserializeAnonymousType(stringCandles, new Candles());

                        var candles = JsonConvert.DeserializeObject<Candles>(stringCandles);

                        // отправляем полученные свечи дальше
                        await SendCandles(exchange, baseq, quote, candles.Data);

                        Debug.WriteLine($"Получены свечи инструмент: {queryStr.Baseq}-{queryStr.Quote}");

                        await Task.Delay(60000, token);

                        countNeedCandles = 1;
                    }
                }, token);
            }
            catch (TaskCanceledException e)
            {
                Debug.WriteLine(e);
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
                throw;
            }            
        }

        /// <summary>
        /// строка подключения к criptocompare по вебсокету
        /// </summary>
        private const string StreamUrl = "wss://streamer.cryptocompare.com/socket.io/?EIO=2&transport=websocket";

        /// <summary>
        /// подписаться на получение данных
        /// </summary>
        /// <param name="queryStr"></param>
        /// <returns></returns>
        private async Task SubscribeTrades(string queryStr)
        {
            try
            {
                if (_webSocket == null)
                {
                    var result = await CreateWebSocketStream();

                    if (result)
                    {
                        _webSocket.Send(queryStr);

                        StartPinger(10000);
                    }
                }

                _webSocket.Send(queryStr);
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
                throw;
            }
        }

        /// <summary>
        /// отписаться от получения данных
        /// </summary>
        public override void UnsubscribePair(OrderToProvider subscribe)
        {
            try
            {
                if (CheckSubscription(subscribe))
                {
                    // генерируем строку отписки согласно полученному запросу
                    var queryStr = GenerateQueryStringTrades("SubRemove", subscribe.Exchange, subscribe.Baseq, subscribe.Quote);

                    _webSocket.Send(queryStr);

                    var key = $"{subscribe.Exchange}_{subscribe.Baseq}_{subscribe.Quote}";

                    // находим токен отмены для этого инструмента
                    var needToken = _allTokenSources[key];

                    if (needToken != null)
                    {
                        needToken.Cancel();
                        needToken.Dispose();
                    }

                    SubscribedPairs.Remove(subscribe);

                    _allTokenSources.Remove(key);
                }                
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
                throw;
            }
        }
        /// <summary>
        /// создать новое подключение
        /// </summary>
        /// <returns></returns>
        private async Task<bool> CreateWebSocketStream()
        {
            try
            {
                _webSocket = new WebSocket(StreamUrl);

                _webSocket.Opened += ResOnOpened;
                _webSocket.Error += ResOnError;
                _webSocket.MessageReceived += ResOnMessageReceived;
                _webSocket.Closed += ResOnClosed;

                return await _webSocket.OpenAsync();
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
                throw;
            }
        }

        /// <summary>
        /// сгененрировать строку запроса трейдов
        /// </summary>
        /// <returns></returns>
        private string GenerateQueryStringTrades(string act, string exchange, string baseq, string quote) // шаблон "42[\"SubAdd\",{\"subs\":[\"0~Bitfinex~BTC~USD\"]}]"
        {
            return $"42[\"{act}\",{{\"subs\":[\"0~{exchange}~{baseq}~{quote}\"]}}]";
        }

        /// <summary>
        /// сгенерировать строку для переподключения
        /// </summary>
        /// <param name="needQueries"></param>
        /// <returns></returns>
        private string GenerateQueryStringTrades(List<OrderToProvider> needQueries)
        {
            string pattern = $"42[\"SubAdd\",{{\"subs\":[";

            for (int i = 0; i < needQueries.Count; i++)
            {
                if (i != needQueries.Count - 1)
                {
                    pattern += $"\"0~{needQueries[i].Exchange}~{needQueries[i].Baseq}~{needQueries[i].Quote}\",";
                }
                else
                {
                    pattern += $"\"0~{needQueries[i].Exchange}~{needQueries[i].Baseq}~{needQueries[i].Quote}\"]}}]";
                }
            }
            return pattern;
        }

        private const string Ping = "42[\"ping\",{}]";

        /// <summary>
        /// пингует сервер, чтобы тот не закрыл соединение
        /// </summary>
        /// <param name="pingInterval"></param>
        private void StartPinger(int pingInterval)
        {
            Task.Run(async () =>
            {
                while (!_token.IsCancellationRequested)
                {
                    await Task.Delay(pingInterval, _token);

                    if (_webSocket.State == WebSocketState.Open)
                    {
                        _webSocket.Send(Ping);
                    }
                }
            }, _token);
        }

        private readonly DateTime _timeStart = new DateTime(1970, 01, 01);

        //private readonly object _newTradeLocker = new object();

        private Trade _newTrade = new Trade();

        private async void ResOnMessageReceived(object sender, MessageReceivedEventArgs messageReceivedEventArgs)
        {
            try
            {
                #region Sync
                //lock (_newTradeLocker)
                //{
                //    var msg = messageReceivedEventArgs.Message;

                //    // 42["m","0~Poloniex~ETH~USD~1~10142529~1532959301~0.0021795~459.23427236~1.00090109~1f"]
                //    if (msg.Contains("42[\"m\",\"0~"))
                //    {
                //        var subString = msg.Substring(10);

                //        var values = subString.Split('~');

                //        if (values.Length > 3)
                //        {
                //            _newTrade.Exchange = values[0];
                //            _newTrade.Baseq = values[1];
                //            _newTrade.Quote = values[2];
                //            _newTrade.Side = values[3] == "1" ? "sell" : "buy";
                //            _newTrade.TradeId = values[4];
                //            _newTrade.Time = _timeStart + TimeSpan.FromSeconds(Convert.ToDouble(values[5]));
                //            _newTrade.Volume = values[6];
                //            _newTrade.Price = values[7];

                //            SendTick(_newTrade);

                //            Debug.WriteLine($"Биржа: {_newTrade.Exchange} Бумага: {_newTrade.Baseq}-{_newTrade.Quote} {_newTrade.Side} время: {_newTrade.Time} объем: {_newTrade.Volume} цена: {_newTrade.Price}");
                //        }
                //    }
                //}


                #endregion

                #region Async
                await Task.Run(async () =>
                {
                    var msg = messageReceivedEventArgs.Message;

                    // 42["m","0~Poloniex~ETH~USD~1~10142529~1532959301~0.0021795~459.23427236~1.00090109~1f"]
                    if (msg.Contains("42[\"m\",\"0~"))
                    {
                        var subString = msg.Substring(10);

                        var values = subString.Split('~');

                        if (values.Length > 3)
                        {
                            _newTrade.Exchange = values[0];
                            _newTrade.Baseq = values[1];
                            _newTrade.Quote = values[2];
                            _newTrade.Side = values[3] == "1" ? "sell" : "buy";
                            _newTrade.TradeId = values[4];
                            _newTrade.Time = _timeStart + TimeSpan.FromSeconds(Convert.ToDouble(values[5]));
                            _newTrade.Volume = values[6];
                            _newTrade.Price = values[7];

                            await SendTick(_newTrade);
                           
                            Debug.WriteLine($"Бумага: {_newTrade.Baseq}-{_newTrade.Quote} {_newTrade.Side} время: {_newTrade.Time} объем: {_newTrade.Volume} цена: {_newTrade.Price}");
                        }
                    }
                    
                }).ConfigureAwait(false);
                #endregion
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
                throw;
            }
        }

        /// <summary>
        /// соединение по вебсокету закрылось
        /// </summary>
        private void ResOnClosed(object sender, EventArgs eventArgs)
        {

#if DEBUG
            Debug.WriteLine("Соединение закрыто, переподключаемся" + DateTime.Now);
#endif
            Task.Run(async () =>
            {
                await Task.Delay(5000);
                RestartReceivingData();
            });
        }

        private void ResOnError(object sender, ErrorEventArgs errorEventArgs)
        {
            Debug.WriteLine(errorEventArgs.ToString() + DateTime.Now);
        }

        private void ResOnOpened(object sender, EventArgs eventArgs)
        {
            Debug.WriteLine("Connected " + DateTime.Now);
        }

        /// <summary>
        /// конечная точка доступа
        /// </summary>
        private readonly string _topicEndpoint = Environment.GetEnvironmentVariable("EG_TOPIC_ENDPOINT");

        /// <summary>
        /// ключ доступа
        /// </summary>
        private readonly string _topicKey = Environment.GetEnvironmentVariable("EG_TOPIC_KEY");

        /// <summary>
        /// Адрес темы EventGrid
        /// </summary>
        readonly string _topicHostname;

        /// <summary>
        /// Клиент EventGrid
        /// </summary>
        readonly EventGridClient _eventGridClient;

        /// <summary>
        /// отправить тик в eventGrid
        /// </summary>
        /// <param name="trade">тик</param>
        private async Task SendTick(Trade trade)
        {
            List<EventGridEvent> eventsList = new List<EventGridEvent>();

            for (int i = 0; i < 1; i++)
            {
                // Формируем данные
                dynamic data = new JObject();
                
                data.exchange = trade.Exchange;
                data.baseq = trade.Baseq;
                data.quote = trade.Quote;
                data.side = trade.Side;
                data.tradeId = trade.TradeId;
                data.time = trade.Time;
                data.volume = trade.Volume;
                data.price = trade.Price;

                // Создаем новое событие
                eventsList.Add(new EventGridEvent()
                {
                    Id = Guid.NewGuid().ToString(), // уникальный идентификатор
                    Subject = $"{trade.Exchange}#{trade.Baseq}/{trade.Quote}", // тема события
                    DataVersion = "1.0", // версия данных
                    EventType = "CPZ.Ticks.NewTick", // тип события
                    Data = data, // данные события
                    EventTime = DateTime.Now // время формирования события
                });
            }
            
            // Отправка событий в тему
            await _eventGridClient.PublishEventsAsync(_topicHostname, eventsList);
            
#if DEBUG
            //Debug.Write("Published events to Event Grid.");
#endif
        }

        /// <summary>
        /// отправить свечи в eventGrid
        /// </summary>
        private async Task SendCandles(string exchange, string baseq, string quote, List<Candle> candles)
        {
            List<EventGridEvent> eventsList = new List<EventGridEvent>();

            for (int i = 0; i < candles.Count; i++)
            {
                // Формируем данные
                dynamic data = new JObject();

                data.exchange = exchange;
                data.baseq = baseq;
                data.quote = quote;
                data.time = candles[i].Time;
                data.open = candles[i].Open;
                data.close = candles[i].Close;
                data.high = candles[i].High;
                data.low = candles[i].Low;
                data.volumeInBaseq = candles[i].Volumefrom;
                data.volumeInQuote = candles[i].Volumeto;

                // Создаем новое событие
                eventsList.Add(new EventGridEvent()
                {
                    Id = Guid.NewGuid().ToString(), // уникальный идентификатор
                    Subject = $"{exchange}#{baseq}/{quote}", // тема события
                    DataVersion = "1.0", // версия данных
                    EventType = "CPZ.Ticks.NewCandles", // тип события
                    Data = data, // данные события
                    EventTime = DateTime.Now // время формирования события
                });
            }

            // Отправка событий в тему
            await _eventGridClient.PublishEventsAsync(_topicHostname, eventsList);

#if DEBUG
            Debug.Write($"Свечи пары {baseq}/{quote} отправленны");
#endif
        }
    }
}
