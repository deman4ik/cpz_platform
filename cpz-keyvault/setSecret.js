const KeyVault = require("azure-keyvault");
const getClient = require("./client");

const clientId = process.env.WRITE_CLIENT_ID; // service principal
const secret = process.env.WRITE_APPLICATION_SECRET;
const vaultUri = process.env.VAULT;

/**
 * Сохранение секрета в хранилище
 *
 * @param {string} secretValue значение
 * @param {string} secretName имя
 * @returns {json} идентификатор
 */
const setSecret = async (secretValue, secretName) => {
  try {
    const keyVaultClient = await getClient(clientId, secret);
    const result = await keyVaultClient.setSecret(
      vaultUri,
      secretName,
      secretValue
    );
    const secretId = KeyVault.parseSecretIdentifier(result.id);
    return secretId;
  } catch (err) {
    console.log(err);
    return new Error(`Can't set secret\n${err}`);
  }
};

module.exports = setSecret;
