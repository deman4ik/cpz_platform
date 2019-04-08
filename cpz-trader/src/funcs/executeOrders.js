import Log from "cpz/log";
import ServiceError from "cpz/error";
import dayjs from "cpz/utils/lib/dayjs";
import { checkEnvVars } from "cpz/utils/environment";
import traderEnv from "cpz/config/environment/trader";
import ConnectorClient from "cpz/connector-client";
import BaseService from "cpz/services/baseService";
import {
  REALTIME_MODE,
  EMULATOR_MODE,
  ORDER_STATUS_OPEN,
  ORDER_STATUS_CLOSED,
  ORDER_STATUS_CANCELED,
  ORDER_TASK_OPEN_MARKET,
  ORDER_TASK_OPEN_LIMIT,
  ORDER_TASK_CHECK,
  ORDER_TASK_CANCEL,
  createCurrentPriceSlug
} from "cpz/config/state";
import MarketStorageClient from "cpz/tableStorage-client/market";
import marketTables, {
  getCurrentPrice
} from "cpz/tableStorage-client/market/currentPrices";
import { SERVICE_NAME } from "../config";
import { traderStateToCommonProps } from "../utils/helpers";

class ExecuteOrders extends BaseService {
  constructor() {
    super();
    this.init();
  }

  init() {
    try {
      // Check environment variables
      checkEnvVars(traderEnv.variables);
      // Configure Logger
      Log.config({
        key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
        serviceName: SERVICE_NAME
      });
      // Configure Connector Client
      this.connector = new ConnectorClient({
        endpoint: process.env.CONNECTOR_API_ENDPOINT,
        key: process.env.CONNECTOR_API_KEY
      });
      // Table Storage
      MarketStorageClient.init(process.env.AZ_STORAGE_MARKET_CS, marketTables);
    } catch (e) {
      Log.exception(e);
      throw e;
    }
  }

  async run(context, { state, data: order }) {
    let orderResult = { ...order };
    try {
      const {
        exchange,
        asset,
        currency,
        timeframe,
        userId,
        lastPrice,
        settings
      } = state;
      let currentPrice = lastPrice;
      Log.addContext(context, traderStateToCommonProps(state));
      // Если задача - проверить исполнения объема
      if (order.task === ORDER_TASK_CHECK) {
        // Если режим - в реальном времени
        if (settings.mode === REALTIME_MODE) {
          // Запрашиваем статус ордера с биржи
          const currentOrder = await this.connector.checkOrder({
            exchange,
            asset,
            currency,
            userId,
            keys: settings.keys,
            exId: order.exId
          });

          orderResult = { ...orderResult, ...currentOrder };
        } else {
          // Если режим - эмуляция или бэктест
          // Считаем, что ордер исполнен
          orderResult.status = ORDER_STATUS_CLOSED;
          // Полностью - т.е. по заданному объему
          orderResult.executed = order.volume;
          orderResult.remaining = 0;
          orderResult.exLastTrade = currentPrice.timestamp;
        }
        // Если задача - выставить лимитный или рыночный ордер
      } else if (
        order.task === ORDER_TASK_OPEN_LIMIT ||
        order.task === ORDER_TASK_OPEN_MARKET
      ) {
        const orderToExecute = { ...order };
        if (
          settings.mode === REALTIME_MODE ||
          settings.mode === EMULATOR_MODE
        ) {
          if (order.task === ORDER_TASK_OPEN_MARKET) {
            try {
              const marketPrice = await getCurrentPrice(
                createCurrentPriceSlug({ exchange, asset, currency })
              );
              if (marketPrice && marketPrice.price) {
                currentPrice = marketPrice;
                orderToExecute.price = marketPrice.price;
              }
            } catch (e) {
              Log.exception(e);
            }
          }
        }
        // Если режим - в реальном времени
        if (settings.mode === REALTIME_MODE) {
          // Публикуем ордер на биржу
          const currentOrder = await this.connector.createOrder({
            exchange,
            asset,
            currency,
            userId,
            keys: settings.keys,
            order: {
              direction: orderToExecute.direction,
              volume: orderToExecute.volume,
              price: orderToExecute.price,
              params: {} // TODO
            }
          });

          orderResult = {
            ...orderResult,
            ...currentOrder,
            status: ORDER_STATUS_OPEN,
            candleTimestamp: dayjs
              .utc()
              .add(-timeframe, "minute")
              .startOf("minute")
              .toISOString()
          };
        } else {
          if (order.task === ORDER_TASK_OPEN_LIMIT) {
            // Если режим - эмуляция или бэктест
            // Если тип ордера - лимитный
            // Считаем, что ордер успешно выставлен на биржу
            orderResult.status = ORDER_STATUS_OPEN;
            orderResult.exId = order.orderId;
            orderResult.exTimestamp = currentPrice.timestamp;
            orderResult.average = currentPrice.price;
            orderResult.remaining = order.volume;
          }
          if (order.task === ORDER_TASK_OPEN_MARKET) {
            // Если режим - эмуляция или бэктест
            // Если тип ордера - по рынку
            // Считаем, что ордер исполнен
            orderResult.status = ORDER_STATUS_CLOSED;
            orderResult.exId = order.orderId;
            orderResult.exTimestamp = currentPrice.timestamp;
            // Полностью - т.е. по заданному объему
            orderResult.executed = orderToExecute.volume;
            orderResult.remaining = 0;
            orderResult.exLastTrade = currentPrice.timestamp;
            orderResult.price = currentPrice.price;
            orderResult.average = currentPrice.price;
          }
        }
      } else if (order.task === ORDER_TASK_CANCEL) {
        if (settings.mode === REALTIME_MODE) {
          const currentOrder = await this.connector.cancelOrder({
            exchange,
            asset,
            currency,
            userId,
            keys: settings.keys,
            exId: order.exId
          });

          orderResult = { ...orderResult, ...currentOrder };
        } else {
          orderResult = { ...orderResult, status: ORDER_STATUS_CANCELED };
        }
      }
      orderResult.task = null;
      orderResult.error = null;
      Log.warn("orderResult", orderResult);
      Log.clearContext();
      return orderResult;
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.TRADER_EXECUTE_ORDER_ERROR,
          cause: e,
          info: { ...traderStateToCommonProps(state), ...order }
        },
        "Failed to execute order"
      );
      // TODO:
      Log.error(error);

      Log.clearContext();
      // Возвращаем ордер как есть
      orderResult.error = error.json;
      return orderResult;
    }
  }
}

const func = new ExecuteOrders();
export default func;
