using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;

namespace CpzTrader
{
    public static class ConfigurationManager
    {
        /// <summary>
        /// взять параметр по имени
        /// </summary>        
        public static string TakeParameterByName(string name)
        {
            var config = new ConfigurationBuilder()
                .SetBasePath(Environment.CurrentDirectory)
                .AddJsonFile("local.settings.json", optional: true, reloadOnChange: true)
                .AddEnvironmentVariables()
                .Build();
         
            string connectionString = config[$"{name}"];

            return connectionString;
        }
    }
}
