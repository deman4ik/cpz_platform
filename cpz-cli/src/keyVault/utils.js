import { createKey, encrypt, setSecret } from "cpz/keyVault";
import dotenv from "dotenv-safe";

dotenv.config();
const {
  KEY_VAULT_URL,
  KEY_VAULT_WRITE_CLIENT_ID,
  KEY_VAULT_WRITE_APP_SECRET
} = process.env;
async function encryptAndSave(keyName, secretName, value) {
  await createKey({
    uri: KEY_VAULT_URL,
    clientId: KEY_VAULT_WRITE_CLIENT_ID,
    appSecret: KEY_VAULT_WRITE_APP_SECRET,
    keyName
  });
  const encryptedData = await encrypt({
    uri: KEY_VAULT_URL,
    clientId: KEY_VAULT_WRITE_CLIENT_ID,
    appSecret: KEY_VAULT_WRITE_APP_SECRET,
    value,
    keyName
  });
  const secret = await setSecret({
    uri: KEY_VAULT_URL,
    clientId: KEY_VAULT_WRITE_CLIENT_ID,
    appSecret: KEY_VAULT_WRITE_APP_SECRET,
    secretValue: encryptedData,
    secretName
  });
  return secret.version;
}

export { encryptAndSave };
