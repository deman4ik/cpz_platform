using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;

namespace CpzTrader.Models
{
    /// <summary>
    /// описывает данные клиента, подписанного на робота
    /// </summary>
    public class Client : TableEntity
    {
        public Client(){}

        public Client(string taskId, string robotId)
        {
            this.RowKey = taskId;
            this.PartitionKey = robotId;
        }

        /// <summary>
        /// уникальный номер пользователя
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// режим "backtest", "emulator", "realtime"]
        /// </summary>
        public string Mode { get; set; }

        /// <summary>
        /// режим отладки
        /// </summary>
        public string DebugMode { get; set; }

        /// <summary>
        /// настройки робота
        /// </summary>
        public RobotSettings RobotSettings { get; set; }

        /// <summary>
        /// настройки робота в JSON формате
        /// </summary>
        public string RobotSettingsJson { get; set; }

        public EmulatorSettings EmulatorSettings { get; set; }

        public string EmulatorSettingsJson { get; set; }

        public List<Position> AllPositions { get; set; }

        public string AllPositionsJson { get; set; }

        /// <summary>
        /// текущий статус клиента  "pending", "started", "busy", "stopped", "error"
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        /// преобразовать объекты в JSON
        /// </summary>
        public void ObjectToJson()
        {
            this.RobotSettingsJson = JsonConvert.SerializeObject(RobotSettings);
            this.EmulatorSettingsJson = JsonConvert.SerializeObject(EmulatorSettings);
        }

        /// <summary>
        /// преобразовать JSON в объекты
        /// </summary>
        public void JsonToObject()
        {
            this.RobotSettings = JsonConvert.DeserializeObject<RobotSettings>(RobotSettingsJson);
            this.EmulatorSettings = JsonConvert.DeserializeObject<EmulatorSettings>(EmulatorSettingsJson);
        }


    }
}
