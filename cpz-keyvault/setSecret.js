const KeyVault = require("azure-keyvault");
const getClient = require("./client");

const clientId = process.env.WRITE_CLIENT_ID; // service principal
const secret = process.env.WRITE_APPLICATION_SECRET;
const vaultUri = process.env.VAULT;

/**
 * Сохранение секрета в хранилище
 *
 * @param {string} secretName имя
 * @param {string} secretValue значение
 * @returns {string} версия
 */
const setSecret = async (secretName, secretValue) => {
  try {
    const keyVaultClient = await getClient(clientId, secret);
    const result = await keyVaultClient.setSecret(
      vaultUri,
      secretName,
      secretValue
    );
    const secretId = KeyVault.parseSecretIdentifier(result.id);
    return secretId.version;
  } catch (err) {
    console.log(err);
    return new Error(`Can't set secret\n${err}`);
  }
};

module.exports = setSecret;
