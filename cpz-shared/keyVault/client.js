import VError from "verror";
import KeyVault from "azure-keyvault";
import { AuthenticationContext } from "adal-node";

/**
 * Клиент к службе Azure KeyVault
 *
 * @param {string} clientId идентификатор приложения
 * @param {string} secret пароль приложения
 * @returns {object} KeyVaultClient
 */
function getClient(clientId, secret) {
  try {
    // Callback for ADAL authentication.
    const adalCallback = (challenge, callback) => {
      const context = new AuthenticationContext(challenge.authorization);
      return context.acquireTokenWithClientCredentials(
        challenge.resource,
        clientId,
        secret,
        (err, tokenResponse) => {
          if (err) {
            throw err;
          }

          // The KeyVaultCredentials callback expects an error, if any, as the first parameter.
          // It then expects a value for the HTTP 'Authorization' header, which we compute based upon the access token obtained with the SP client credentials.
          // The token type will generally equal 'Bearer' - in some user-specific situations, a different type of token may be issued.
          return callback(
            null,
            `${tokenResponse.tokenType} ${tokenResponse.accessToken}`
          );
        }
      );
    };

    const keyVaultClient = new KeyVault.KeyVaultClient(
      new KeyVault.KeyVaultCredentials(adalCallback)
    );

    return keyVaultClient;
  } catch (error) {
    throw new VError(
      { name: "KeyVaultError", cause: error },
      "Failed to create KeyVault client"
    );
  }
}

export default getClient;
