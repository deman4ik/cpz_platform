using CPZMarketWatcher.Models;
using Newtonsoft.Json;
using SuperSocket.ClientEngine;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
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

        }

        private WebSocket _webSocket;

        /// <summary>
        /// список бумаг на которые уже подписаны
        /// </summary>
        public override List<StartImportQuery> SubscribedPairs { get; set; } = new List<StartImportQuery>();

        /// <summary>
        /// проверить был ли такой запрос
        /// </summary>       
        /// <param name="newQuery">запрос на получение данных</param>
        /// <returns></returns>
        private bool CheckSubscription(StartImportQuery newQuery)
        {
            var needQuery = SubscribedPairs.Find(q =>
                q.Exchange == newQuery.Exchange &&
                q.Baseq == newQuery.Baseq &&
                q.Quote == newQuery.Quote);

            if (needQuery == null)
            {
                SubscribedPairs.Add(newQuery);
                return false;
            }
            return true;
        }

        /// <summary>
        /// запустить получение данных
        /// </summary>
        /// <param name="subscribe"></param>
        public override async void StartReceivingData(StartImportQuery subscribe)
        {
            try
            {
                if (!CheckSubscription(subscribe))
                {
                    // генерируем строку подписки согласно полученному запросу
                    var queryStr = GenerateQueryStringTrades(subscribe.Exchange, subscribe.Baseq, subscribe.Quote);

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
        private async Task StartCandleLoad(StartImportQuery queryStr)
        {
            await Task.Run(async () =>
            {
                int countNeedCandles = 10000;
                while (true)
                {
                    var url = $"https://min-api.cryptocompare.com/data/histominute?fsym={queryStr.Baseq}&tsym={queryStr.Quote}&limit={countNeedCandles}";

                    var stringCandles = await client.GetStringAsync(url);

                    var res = JsonConvert.DeserializeAnonymousType(stringCandles, new Candles());
                    Debug.WriteLine($"Получены свечи инструмент: {queryStr.Baseq}-{queryStr.Quote}");
                    await Task.Delay(60000);

                    countNeedCandles = 1;
                }
            });
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
        private string GenerateQueryStringTrades(string exchange, string baseq, string quote) // шаблон "42[\"SubAdd\",{\"subs\":[\"0~Bitfinex~BTC~USD\"]}]"
        {
            return $"42[\"SubAdd\",{{\"subs\":[\"0~{exchange}~{baseq}~{quote}\"]}}]";
        }

        /// <summary>
        /// сгенерировать строку для переподключения
        /// </summary>
        /// <param name="needQueries"></param>
        /// <returns></returns>
        private string GenerateQueryStringTrades(List<StartImportQuery> needQueries)
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

        private CancellationTokenSource _tokenSource;

        private const string Ping = "42[\"ping\",{}]";

        /// <summary>
        /// пингует сервер, чтобы тот не закрыл соединение
        /// </summary>
        /// <param name="pingInterval"></param>
        private void StartPinger(int pingInterval)
        {
            _tokenSource = new CancellationTokenSource();

            CancellationToken token = _tokenSource.Token;

            Task.Run(async () =>
            {
                while (!token.IsCancellationRequested)
                {
                    await Task.Delay(pingInterval, token);

                    if (_webSocket.State == WebSocketState.Open)
                    {
                        _webSocket.Send(Ping);
                    }
                }
            }, token);
        }

        private readonly DateTime _timeStart = new DateTime(1970, 01, 01);

        private readonly object _newTradeLocker = new object();

        private Trade _newTrade = new Trade();

        private void ResOnMessageReceived(object sender, MessageReceivedEventArgs messageReceivedEventArgs)
        {
            try
            {
                lock (_newTradeLocker)
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

                            Debug.WriteLine($"Биржа: {_newTrade.Exchange} Бумага: {_newTrade.Baseq}-{_newTrade.Quote} {_newTrade.Side} время: {_newTrade.Time} объем: {_newTrade.Volume} цена: {_newTrade.Price}");
                        }
                    }
                }
                #region Async
                //await Task.Run(() =>
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

                //            if (_newTrade.Baseq == "BTC" && _newTrade.Quote == "USD" && _newTrade.Exchange == "Bitfinex")
                //            {
                //                Debug.WriteLine($"Бумага: {_newTrade.Baseq}-{_newTrade.Quote} {_newTrade.Side} время: {_newTrade.Time} объем: {_newTrade.Volume} цена: {_newTrade.Price}");
                //            }
                //        }
                //    }

                //    //Thread.CurrentThread.ManagedThreadId);
                //}, _cancellationToken).ConfigureAwait(false);
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
    }
}
