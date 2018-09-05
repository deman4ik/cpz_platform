using Microsoft.Extensions.Configuration;
using System;

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
                .AddJsonFile("configuration.json", optional: true, reloadOnChange: true)
                .AddEnvironmentVariables()
                .Build();

            string value = config[$"{name}"];
            return value;
        }
    }
}
