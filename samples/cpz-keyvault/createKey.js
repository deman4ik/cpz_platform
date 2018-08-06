const KeyVault = require("azure-keyvault");
const getClient = require("./client");

const CLIENT_ID = process.env.WRITE_CLIENT_ID; // service principal
const SECRET = process.env.WRITE_APPLICATION_SECRET;
const VAULT_URI = process.env.VAULT;

/**
 * Создание нового ключа
 *
 * @param {string} keyName имя
 * @returns {string} версия
 */
const createKey = async keyName => {
  try {
    const keyVaultClient = await getClient(CLIENT_ID, SECRET);

    const keyOperations = ["encrypt", "decrypt"];
    const keyOptions = {
      keySize: 4096,
      keyOps: keyOperations
    };

    const result = await keyVaultClient.createKey(
      VAULT_URI,
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
