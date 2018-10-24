using Microsoft.Extensions.Configuration;
using System;

namespace CPZMarketWatcher.Services
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
                .AddJsonFile("configuration.json", optional: false, reloadOnChange: true)
                .Build();

            string value = config[$"Values:{name}"];

            return value;
        }
    }
}
