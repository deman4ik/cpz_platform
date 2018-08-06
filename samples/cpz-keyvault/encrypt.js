const getClient = require("./client");

const CLIENT_ID = process.env.WRITE_CLIENT_ID; // service principal
const SECRET = process.env.WRITE_APPLICATION_SECRET;
const VAULT_URI = process.env.VAULT;

/**
 * Шифрование сообщения
 *
 * @param {string} value сообщение
 * @param {string} keyName имя ключа
 * @param {string} keyVersion версия ключа
 * @returns {json} зашифрованное сообщение
 */
const encrypt = async (value, keyName, keyVersion = "") => {
  try {
    const keyVaultClient = await getClient(CLIENT_ID, SECRET);

    const result = await keyVaultClient.encrypt(
      VAULT_URI,
      keyName,
      keyVersion,
      "RSA-OAEP",
      Buffer.from(value)
    );

    return JSON.stringify(result.result);
  } catch (err) {
    console.log(err);
    return new Error(`Can't encrypt value\n${err}`);
  }
};

module.exports = encrypt;
