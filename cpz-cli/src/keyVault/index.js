import { v4 as uuid } from "uuid";
import { createKey, encrypt, setSecret } from "cpzKeyVault";
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
async function saveAPIKeys(args) {
  this.log(args);
  const { APIKey, APISecret } = args;
  const {
    user,
    spare,
    APIKeyEncrKeyName,
    APISecretEncrKeyName,
    APIKeySecretName,
    APISecretSecretName
  } = args.options;

  const info = {
    APIKey: {},
    APISecret: {}
  };
  if (user) {
    info.APIKey.encryptionKeyName = user.toString();
    info.APISecret.encryptionKeyName = user.toString();
    info.APIKey.name = user.toString();
    info.APISecret.name = user.toString();
  }
  info.APIKey.encryptionKeyName =
    APIKeyEncrKeyName || info.APIKey.encryptionKeyName || uuid();
  info.APISecret.encryptionKeyName =
    APISecretEncrKeyName || info.APISecret.encryptionKeyName || uuid();
  info.APIKey.name = APIKeySecretName || info.APIKey.name || uuid();
  info.APISecret.name = APISecretSecretName || info.APISecret.name || uuid();
  info.APIKey.version = await encryptAndSave(
    info.APIKey.encryptionKeyName,
    info.APIKey.name,
    APIKey
  );
  info.APISecret.version = await encryptAndSave(
    info.APISecret.encryptionKeyName,
    info.APISecret.name,
    APISecret
  );

  const keys = {};
  if (spare) {
    keys.spare = info;
  } else {
    keys.main = info;
  }

  this.log(JSON.stringify(keys));
}

export { saveAPIKeys };
