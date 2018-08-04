const KeyVault = require("azure-keyvault");
const getClient = require("./client");

const CLIENT_ID = process.env.WRITE_CLIENT_ID; // service principal
const SECRET = process.env.WRITE_APPLICATION_SECRET;
const VAULT_URI = process.env.VAULT;

/**
 * Сохранение секрета в хранилище
 *
 * @param {string} secretValue значение
 * @param {string} secretName имя
 * @returns {json} идентификатор
 */
const setSecret = async (secretValue, secretName) => {
  try {
    const keyVaultClient = await getClient(CLIENT_ID, SECRET);
    const result = await keyVaultClient.setSecret(
      VAULT_URI,
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
