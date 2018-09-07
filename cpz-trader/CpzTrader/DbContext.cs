using CpzTrader.Models;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;

namespace CpzTrader
{
    /// <summary>
    /// набор методов доступа к базе данных
    /// </summary>
    public static class DbContext
    {
        /// <summary>
        /// инициализирует тестовых клиентов
        /// </summary>
        /// <param name="advisorName">имя советника</param>
        public static List<Client> GetClientsInfo(string advisorName)
        {
            List<Client> _clients = new List<Client>();

            for (int i = 0; i < 1; i++)
            {
                _clients.Add(new Client(i.ToString(), advisorName)
                {
                    TradeSettings = new TradeSettings()
                    {
                        PublicKey = i == 0 ? "111" : "pubKey" + i,
                        PrivateKey = i == 0 ? "222" : "pubKey" + i,
                        Volume = i + 12,
                    },
                    EmulatorSettings = new EmulatorSettings()
                    {
                        Slippage = 10 + i,
                        StartingBalance = 10000 + i * 300,
                        CurrentBalance = 10000 + i * 300,
                    },

                    IsEmulation = false,
                });
            }
            return _clients;
        }

        /// <summary>
        /// сохранить информацию о клиентах в базе
        /// </summary>
        /// <param name="clients">список клиентов</param>
        public static async Task SaveClientsInfoDbAsync(List<Client> clients)
        {
            try
            {
                var appParameter = "AZ_STORAGE_CS";

                string connectionString = Environment.GetEnvironmentVariable(appParameter);

                // подключаемся к локальному хранилищу
                var cloudStorageAccount = CloudStorageAccount.Parse(connectionString);

                // создаем объект для работы с таблицами
                var cloudTableClient = cloudStorageAccount.CreateCloudTableClient();

                // получаем нужную таблицу
                var table = cloudTableClient.GetTableReference("Traders");

                // если она еще не существует - создаем
                var res = table.CreateIfNotExistsAsync().Result;

                TableBatchOperation batchOperation = new TableBatchOperation();

                // сохраняем пачкой элементы в таблице
                foreach (var client in clients)
                {
                    client.AllPositionsJson = JsonConvert.SerializeObject(client.AllPositions);

                    client.TradeSettingsJson = JsonConvert.SerializeObject(client.TradeSettings);

                    client.EmulatorSettingsJson = JsonConvert.SerializeObject(client.EmulatorSettings);

                    batchOperation.Insert(client);
                }

                await table.ExecuteBatchAsync(batchOperation);
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
                throw;
            }
        }

        /// <summary>
        /// получить из базы клиентов по имени советника
        /// </summary>
        /// <param name="advisorName">имя советника</param>
        /// <returns></returns>
        public static async Task<List<Client>> GetClientsInfoFromDbAsync(string advisorName)
        {
            try
            {
                var appParameter = "AZ_STORAGE_CS";

                string connectionString = Environment.GetEnvironmentVariable(appParameter);

                var cloudStorageAccount = CloudStorageAccount.Parse(connectionString);

                var cloudTableClient = cloudStorageAccount.CreateCloudTableClient();

                var table = cloudTableClient.GetTableReference("Traders");

                // формируем фильтр, чтобы получить клиентов для нужного робота
                var query = new TableQuery<Client>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, advisorName));

                TableQuerySegment<Client> result = await table.ExecuteQuerySegmentedAsync(query, new TableContinuationToken());

                List<Client> clients = new List<Client>();

                foreach (var client in result)
                {
                    client.AllPositions = JsonConvert.DeserializeObject<List<Position>>(client.AllPositionsJson);

                    client.TradeSettings = JsonConvert.DeserializeObject<TradeSettings>(client.TradeSettingsJson);

                    client.EmulatorSettings = JsonConvert.DeserializeObject<EmulatorSettings>(client.EmulatorSettingsJson);

                    clients.Add(client);
                }

                return clients;

            }
            catch (StorageException e)
            {
                Debug.WriteLine(e);
                return null;
            }

            catch (Exception e)
            {
                Debug.WriteLine(e);
                throw;
            }
        }


        /// <summary>
        /// обновить запись о клиенте в базе
        /// </summary>        
        public static async Task<bool> UpdateClientInfoAsync(Client input)
        {
            try
            {
                var client = input;

                var appParameter = "AZ_STORAGE_CS";

                string connectionString = Environment.GetEnvironmentVariable(appParameter);

                var cloudStorageAccount = CloudStorageAccount.Parse(connectionString);

                // создаем объект для работы с таблицами
                var cloudTableClient = cloudStorageAccount.CreateCloudTableClient();

                // получаем нужную таблицу
                var table = cloudTableClient.GetTableReference("Traders");

                // создаем операцию получения
                TableOperation retrieveOperation = TableOperation.Retrieve<Client>(client.PartitionKey, client.RowKey);

                // выполняем операцию
                var retrievedResult = await table.ExecuteAsync(retrieveOperation);

                // получаем результат
                Client updateEntity = (Client)retrievedResult.Result;

                // изменяем данные и сохраняем
                if (updateEntity != null)
                {
                    updateEntity.AllPositionsJson = JsonConvert.SerializeObject(client.AllPositions);

                    updateEntity.TradeSettingsJson = JsonConvert.SerializeObject(client.TradeSettings);

                    updateEntity.EmulatorSettingsJson = JsonConvert.SerializeObject(client.EmulatorSettings);

                    updateEntity.CountPositions = client.AllPositions.Count;

                    updateEntity.CountOpenOrders = client.AllPositions[client.AllPositions.Count - 1].OpenOrders.FindAll(order => order.State == OrderState.Closed).Count;

                    updateEntity.CountCloseOrders = client.AllPositions[client.AllPositions.Count - 1].CloseOrders.FindAll(order => order.State == OrderState.Closed).Count;

                    updateEntity.ETag = "*";

                    TableOperation updateOperation = TableOperation.Replace(updateEntity);

                    await table.ExecuteAsync(updateOperation);

                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (StorageException e)
            {
                Debug.WriteLine(e);
                return false;
            }

            catch (Exception e)
            {
                Debug.WriteLine(e);
                throw;
            }
        }
    }
}
