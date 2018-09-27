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

                var tableName = ConfigurationManager.TakeParameterByName("ClientsTableName");

                var table = cloudTableClient.GetTableReference(tableName);

                // формируем фильтр, чтобы получить клиентов для нужного робота
                var query = new TableQuery<Client>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, advisorName));

                TableQuerySegment<Client> result = await table.ExecuteQuerySegmentedAsync(query, new TableContinuationToken());

                List<Client> clients = new List<Client>();

                foreach (var client in result)
                {
                    client.AllPositions = JsonConvert.DeserializeObject<List<Position>>(client.AllPositionsJson);

                    client.EmulatorSettings = JsonConvert.DeserializeObject<EmulatorSettings>(client.EmulatorSettingsJson);

                    client.RobotSettings = JsonConvert.DeserializeObject<RobotSettings>(client.RobotSettingsJson);

                    clients.Add(client);
                }

                return clients;

            }
            catch (StorageException e)
            {
                return null;
            }

            catch (Exception e)
            {
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

                var tableName = ConfigurationManager.TakeParameterByName("ClientsTableName");

                // получаем нужную таблицу
                var table = cloudTableClient.GetTableReference(tableName);

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

                    updateEntity.EmulatorSettingsJson = JsonConvert.SerializeObject(client.EmulatorSettings);
                   
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


        /// <summary>
        /// получить из базы позиции по ключу
        /// </summary>
        public static async Task<List<Position>> GetAllPositionsByKeyAsync(string partitionKey)
        {
            try
            {
                var appParameter = "AZ_STORAGE_CS";

                string connectionString = Environment.GetEnvironmentVariable(appParameter);

                var cloudStorageAccount = CloudStorageAccount.Parse(connectionString);

                var cloudTableClient = cloudStorageAccount.CreateCloudTableClient();

                var tableName = ConfigurationManager.TakeParameterByName("PositionsTableName");

                var table = cloudTableClient.GetTableReference(tableName);

                // формируем фильтр, чтобы получить позиции по нужному инструменту
                var query = new TableQuery<Position>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, partitionKey))
                                                      .Where(TableQuery.GenerateFilterCondition("State", QueryComparisons.NotEqual, "1"))
                                                      .Where(TableQuery.GenerateFilterCondition("State", QueryComparisons.NotEqual, "3"));

                TableQuerySegment<Position> result = await table.ExecuteQuerySegmentedAsync(query, new TableContinuationToken());

                List<Position> positions = new List<Position>();

                foreach (var position in result)
                {
                    position.JsonToObject();

                    positions.Add(position);
                }

                return positions;
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

        //-------------------------------------------------------------------------------------------------------------------------------------


        /// <summary>
        /// вставить сущность в таблицу
        /// </summary>
        public static async Task<bool> InsertEntity<T>(string tableName, T entyti) where T: TableEntity
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
                var table = cloudTableClient.GetTableReference(tableName);

                // если она еще не существует - создаем
                await table.CreateIfNotExistsAsync();

                TableOperation insertOperation = TableOperation.Insert(entyti);

                await table.ExecuteAsync(insertOperation);

                return true;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /// <summary>
        /// получить одну сущность из хранилища 
        /// </summary>
        /// <typeparam name="T">тип нужной сущьности</typeparam>
        /// <param name="tableName">имя таблицы</param>
        /// <param name="partitionKey">ключ раздела</param>
        /// <param name="rowKey">ключ строки</param>
        /// <returns>экземпляр сущности</returns>
        public static async Task<T> GetEntityById<T>(string tableName, string partitionKey, string rowKey) where T: TableEntity
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
                var table = cloudTableClient.GetTableReference(tableName);

                TableOperation retrieveOperation = TableOperation.Retrieve<T>(partitionKey, rowKey);

                var retrievedResult = await table.ExecuteAsync(retrieveOperation);

                if (retrievedResult.Result != null)
                {
                    var res = retrievedResult.Result;
                    return (T)res;
                }
                else
                {
                    return null;
                }
            }
            catch(Exception e)
            {
                throw;
            }            
        }

        /// <summary>
        /// обновить сущьность в хранилище
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="tableName">имя таблицы</param>
        /// <param name="partitionKey">ключ раздела</param>
        /// <param name="rowKey">ключ строки</param>
        /// <param name="updatedEntyti">обновленная сущьность</param>
        /// <returns></returns>
        public static async Task<bool> UpdateEntityById<T>(string tableName, string partitionKey, string rowKey, T updatedEntyti) where T : TableEntity
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
                var table = cloudTableClient.GetTableReference(tableName);

                TableOperation retrieveOperation = TableOperation.Retrieve<Position>(partitionKey, rowKey);

                var retrievedResult = await table.ExecuteAsync(retrieveOperation);

                if (retrievedResult.Result != null)
                {
                    TableOperation updateOperation = TableOperation.Replace(updatedEntyti);

                    await table.ExecuteAsync(updateOperation);

                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch(Exception e)
            {
                throw;
            }            
        }
    }
}
