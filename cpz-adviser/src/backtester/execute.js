import VError from "verror";
import { STATUS_FINISHED, STATUS_ERROR } from "cpzState";
import publishEvents from "cpzEvents";
import { ADVISER_SERVICE } from "cpzServices";
import {
  TASKS_ADVISER_BACKTESTFINISHED_EVENT,
  ERROR_ADVISER_EVENT,
  SIGNALS_TOPIC,
  ERROR_TOPIC,
  TASKS_TOPIC
} from "cpzEventTypes";
import { createErrorOutput } from "cpzUtils/error";
import getHistoryCandles from "cpzDB/historyCandles";
import Backtester from "./backtester";

async function backtest(context, eventData) {
  let backtester;
  try {
    context.log.info(`Starting backtest ${eventData.taskId}...`);
    // Создаем экземпляр класса Adviser
    backtester = new Backtester(context, eventData);
    // Если необходим прогрев
    if (eventData.requiredHistoryCache && eventData.requiredHistoryMaxBars) {
      // Формируем параметры запроса
      const requiredHistoryRequest = {
        exchange: eventData.exchangeId,
        asset: eventData.asset,
        currency: eventData.currency,
        timeframe: eventData.timeframe,
        dateTo: eventData.dateFrom,
        first: eventData.requiredHistoryMaxBars,
        orderByTimestampDesc: true
      };
      // Запрашиваем свечи из БД
      const getRequiredHistoryResult = await getHistoryCandles(
        requiredHistoryRequest
      );
      // Если загрузили меньше свечей чем запросили
      if (
        getRequiredHistoryResult.nodes.length < eventData.requiredHistoryMaxBars
      ) {
        // Генерируем ошибку
        throw new VError(
          {
            name: "HistoryRangeError",
            info: {
              requiredHistoryMaxBars: eventData.requiredHistoryMaxBars,
              actualHistoryMaxBars: getRequiredHistoryResult.nodes.length
            }
          },
          "Can't load history required: %s bars but loaded: %d bars",
          eventData.requiredHistoryMaxBars,
          getRequiredHistoryResult.nodes.length
        );
      }
      // Сортируем загруженные свечи в порядке возрастания
      const requiredHistory = getRequiredHistoryResult.nodes.reverse();
      backtester.setCachedCandles(requiredHistory);
    }
    await backtester.save();
    // Загружаем пачками основной массив свечей из БД
    let loadHistoryIteration = {
      taskId: eventData.taskId,
      exchange: eventData.exchangeId,
      asset: eventData.asset,
      currency: eventData.currency,
      timeframe: eventData.timeframe,
      dateFrom: eventData.dateFrom,
      dateTo: eventData.dateTo,
      first: 500,
      pageInfo: { hasNextPage: true }
    };
    while (loadHistoryIteration.pageInfo.hasNextPage) {
      /* eslint-disable no-await-in-loop */
      const getHistoryCandlesResult = await getHistoryCandles(
        loadHistoryIteration
      );
      /* no-await-in-loop */
      // Устанавливем общее количество баров
      backtester.setTotalBars(getHistoryCandlesResult.totalCount);
      const historyCandles = getHistoryCandlesResult.nodes;
      // Обрабатываем по очереди
      historyCandles.map(async candle => {
        await backtester.handleCandle(candle);
        // Если есть хотя бы одно событие для отправка
        if (backtester.events.length > 0) {
          // Отправляем
          await publishEvents(context, SIGNALS_TOPIC, backtester.events);
        }
        // Сохраянем состояние итерации
        await backtester.saveItem();
      });
      // Сохраняем состояние пачки
      await backtester.save();
      // Формируем новую итерацию обработки
      loadHistoryIteration = {
        ...loadHistoryIteration,
        after: getHistoryCandlesResult.pageInfo.endCursor,
        pageInfo: getHistoryCandlesResult.pageInfo
      };
    }
    await backtester.end(STATUS_FINISHED);
    await publishEvents(context, TASKS_TOPIC, {
      service: ADVISER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_ADVISER_BACKTESTFINISHED_EVENT,
      data: {
        taskId: eventData.taskId
      }
    });
    context.log.info(`Backtest ${eventData.taskId} finished!`);
  } catch (error) {
    const err = new VError(
      {
        name: "AdviserBacktestError",
        cause: error,
        info: {
          eventData
        }
      },
      'Failed to execute backtest taskId: "%s"',
      eventData.taskId
    );
    const errorOutput = createErrorOutput(err);
    context.log.error(JSON.stringify(errorOutput));
    // Если есть экземпляр класса
    if (backtester) {
      // Сохраняем ошибку в сторедже и завершаем работу
      await backtester.end(STATUS_ERROR, errorOutput);
    }
    // Публикуем событие - ошибка
    await publishEvents(context, ERROR_TOPIC, {
      service: ADVISER_SERVICE,
      subject: eventData.eventSubject,
      eventType: ERROR_ADVISER_EVENT,
      data: {
        taskId: eventData.taskId,
        mode: "backtest",
        error: errorOutput
      }
    });
  }
}

export default backtest;
