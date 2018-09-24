# Cryptuoso Platform

## Запуск с помощью Docker Compose

1. Описать переменные окружения в файле .env в корне проекта

```
AzureWebJobsStorage=СТРОКА_ПОДКЛЮЧЕНИЯ_К_АЗУР_СТОРЕДЖУ_ДЛЯ_ВЕБДЖОБОВ
AZ_STORAGE_CS=СТРОКА_ПОДКЛЮЧЕНИЯ_К_АЗУР_СТОРЕДЖУ_ДЛЯ_ХРАНЕНИЯ_ЛОКАЛЬНЫХ_ДАННЫХ
API_KEY=АПИ_КЛЮЧ
EG_TEST_ENDPOINT=АДРЕС_УЗЛА_ЭВЕНТГРИД
EG_TEST_KEY=КЛЮЧ_ТОПИКА_ЭВЕНТГРИД
DB_API_ENDPOINT=http://cpz-postgraphile:80/graphql
CUSTOMCONNSTR_POSTGRESQL=СТРОКА_ПОДКЛЮЧЕНИЯ_К_ПОСТГРЕС
PROXY_ENDPOINT=АДРЕС_ПРОКСИ_СЕРВЕРА
EG_EMULATOR_MODE=true
LOG_TABLE_STORAGE=true
NODE_TLS_REJECT_UNAUTHORIZED=0
```

2. Собрать все контейнеры командой:

```
docker-compose build
```

3. Запустить все контейнеры командой:

```
docker-compose up
```

4. Отправлять события управления сервиса по адресу

Type: POST
Content-Type: application/json
```
https://localhost:8100/api/events
```
