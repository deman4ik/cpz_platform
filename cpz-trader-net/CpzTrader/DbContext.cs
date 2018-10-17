﻿using CpzTrader.Models;
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
        public static async Task<List<Client>> GetClientsInfoFromDbAsync(string advisorName, string subject = "")
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
                var query = new TableQuery<Client>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, advisorName))
                                                    .Where(TableQuery.GenerateFilterCondition("Status", QueryComparisons.Equal, "started"));

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
                string message = "error when getting the right clients";

                // отправить сообщение об ошибке
                await EventGridPublisher.SendError((int)ErrorCodes.DataBase, message, null, subject, null, e.Message);
                return null;
            }

            catch (Exception e)
            {
                string message = "error when getting the right clients";

                // отправить сообщение об ошибке
                await EventGridPublisher.SendError((int)ErrorCodes.DataBase, message, null, subject, null, e.Message);
                throw;
            }
        }


        /// <summary>
        /// получить из базы позиции по ключу
        /// </summary>
        public static async Task<List<Position>> GetAllPositionsByKeyAsync(string partitionKey, string subject = "")
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
                var query = new TableQuery<Position>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, partitionKey));                

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
                string message = "error while trying to get the required line item";

                // отправить сообщение об ошибке
                await EventGridPublisher.SendError((int)ErrorCodes.DataBase, message, "", subject, null, e.Message);
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
        public static async Task<bool> InsertEntity<T>(string tableName, T entyti, string subject = "") where T: TableEntity
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
                string message = "error when trying to insert an entity into a table";

                // отправить сообщение об ошибке
                await EventGridPublisher.SendError((int)ErrorCodes.DataBase, message, entyti.RowKey, subject, null, e.Message);
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
        public static async Task<T> GetEntityById<T>(string tableName, string partitionKey, string rowKey, string subject = "") where T: TableEntity
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
                    string message = "the requested entity was not found in the repository";

                    // отправить сообщение об ошибке
                    await EventGridPublisher.SendError((int)ErrorCodes.DataBase, message, rowKey, subject, null, message);

                    return null;
                }
            }
            catch(Exception e)
            {
                string message = "error when trying to get an entity in storage";

                // отправить сообщение об ошибке
                await EventGridPublisher.SendError((int)ErrorCodes.DataBase, message, rowKey, subject, null, e.Message);

                throw e;
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
        public static async Task<bool> UpdateEntityById<T>(string tableName, string partitionKey, string rowKey, T updatedEntyti, string subject = "") where T : TableEntity
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
                    string message = "attempt to update an existing record";

                    throw new Exception(message);
                }
            }
            catch(Exception e)
            {
                if (e.Message == "Precondition Failed")
                {
                    string message = "attempt to change a record that has already been updated since the extraction";

                    // отправить сообщение об ошибке
                    await EventGridPublisher.SendError((int)ErrorCodes.DataBase, message, updatedEntyti.RowKey, subject, updatedEntyti, e.Message);

                    return false;
                }
                else
                {
                    throw e;
                }                
            }            
        }
    }
}