const KeyVault = require("azure-keyvault");
const getClient = require("./client");

const clientId = process.env.WRITE_CLIENT_ID; // service principal
const secret = process.env.WRITE_APPLICATION_SECRET;
const vaultUri = process.env.VAULT;

/**
 * Создание нового ключа
 *
 * @param {string} keyName имя
 * @returns {string} версия
 */
const createKey = async keyName => {
  try {
    const keyVaultClient = await getClient(clientId, secret);

    const keyOperations = ["encrypt", "decrypt"];
    const keyOptions = {
      keySize: 4096,
      keyOps: keyOperations
    };

    const result = await keyVaultClient.createKey(
      vaultUri,
      keyName,
      "RSA",
      keyOptions
    );

    const keyId = KeyVault.parseKeyIdentifier(result.key.kid);
    return keyId;
  } catch (err) {
    console.log(err);
    return new Error(`Can't create new key\n${err}`);
  }
};

module.exports = createKey;
