const KeyVault = require("azure-keyvault");
const { AuthenticationContext } = require("adal-node");

/**
 * Клиент к службе Azure KeyVault
 *
 * @param {string} clientId идентификатор приложения
 * @param {string} secret пароль приложения
 * @returns {object} KeyVaultClient
 */
const getClient = async (clientId, secret) => {
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
  } catch (err) {
    return new Error(`Can't create KeyVault client\n${err}`);
  }
};

module.exports = getClient;
