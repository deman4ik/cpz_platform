# Пример работы с службой Azure KeyVault

[index.js](./index.js) - Пример сохранения и считывания секретов в Azure KeyVault 

Переменные окружения:
```
VAULT = "https://SOME_URI"
READ_CLIENT_ID = "READ_ONLY_ACCESS_APP_ID"
READ_APPLICATION_SECRET = "READ_ONLY_ACCESS_APP_SECRET"
WRITE_CLIENT_ID = "WRITE_ONLY_ACCESS_APP_ID"
WRITE_APPLICATION_SECRET = "WRITE_ONLY_ACCESS_APP_SECRET"
```

Запуск:
```javascript
npm install
node index.js
```

### Состав:
[client.js](./client.js) - клиент к службе Azure KeyVault

Пример использования:
```javascript
const getClient = require("./client");
const clientId = process.env.CLIENT_ID;
const secret = process.env.APPLICATION_SECRET;
const keyVaultClient = await getClient(clientId, secret);

const result = await keyVaultClient.SOME_ACTION(...);
```

[createKey.js](./createKey.js) - создания ключа в KeyVault

Пример использования:
```javascript
const createKey = require("./createKey");
const key = await createKey("SOME_KEY_NAME");
```

[encrypt.js](./encrypt.js) - шифрования сообщения с помощью ключа

Пример использования:
```javascript
const encrypt = require("./encrypt");
const encryptResult = await encrypt("SOME_STRING_VALUE", "SOME_KEY_NAME");
```

[decrypt.js](./decrypt.js) - расшифровка сообщения с помощью ключа

Пример использования:
```javascript
const decrypt = require("./decrypt");
const decryptResult = await decrypt("SOME_JSON_STRINGIFIED_VALUE", "SOME_KEY_NAME");
```

[setSecret.js](./setSecret.js) - сохранения сообщения в KeyVault

Пример использования:
```javascript
const setSecret = require("./setSecret");
const secret = await setSecret("SOME_STRINGIFIED_VALUE", "SOME_SECRET_NAME");
```

[getSecret.js](./getSecret.js) - считывание сообщения из KeyVault

Пример использования:
```javascript
const getSecret = require("./getSecret");
const secretValue = await getSecret("SOME_SECRET_NAME");
```