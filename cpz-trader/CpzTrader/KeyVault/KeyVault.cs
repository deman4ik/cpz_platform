using Microsoft.Azure.KeyVault;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using System;
using System.Threading.Tasks;

namespace CpzTrader.KeyVault
{
    public static class KeyVault
    {
        /// <summary>
        /// возвращает маркер проверки подлинности
        /// </summary>
        public static async Task<string> GetToken(string authority, string resource, string scope)
        {
            var authContext = new AuthenticationContext(authority);
            ClientCredential clientCred = new ClientCredential(Environment.GetEnvironmentVariable("CLIENT_ID"),Environment.GetEnvironmentVariable("CLIENT_SECRET"));
            AuthenticationResult result = await authContext.AcquireTokenAsync(resource, clientCred);

            if (result == null)
                throw new InvalidOperationException("Failed to obtain the JWT token");

            return result.AccessToken;
        }

        /// <summary>
        /// считать секрет из хранилища 
        /// </summary>
        /// <param name="secretName">имя секрета</param>
        /// <param name="secretVersion">версия</param>
        /// <returns>секретный ключ</returns>
        public static async Task<string> GetSecret(string secretName, string secretVersion = "")
        {            
            var kvClient = new KeyVaultClient(new KeyVaultClient.AuthenticationCallback(GetToken));

            string tradeKey = (await kvClient.GetSecretAsync(Environment.GetEnvironmentVariable("VAULT_URI"), secretName, secretVersion)).Value;

            return tradeKey;
        }
    }
}
