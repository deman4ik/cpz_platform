import dayjs from "dayjs";
import VError from "verror";
import { STATUS_STARTED, STATUS_FINISHED, STATUS_ERROR } from "cpzState";
import publishEvents from "cpzEvents";
import { BACKTESTER_SERVICE } from "cpzServices";
import {
  TASKS_BACKTESTER_STARTED_EVENT,
  TASKS_BACKTESTER_FINISHED_EVENT,
  ERROR_ADVISER_EVENT,
  SIGNALS_TOPIC,
  ERROR_TOPIC,
  TASKS_TOPIC,
  TRADES_TOPIC
} from "cpzEventTypes";
import { createErrorOutput } from "cpzUtils/error";
import getHistoryCandles from "cpzDB/historyCandles";
import { createBacktesterSlug } from "cpzStorage/utils";
import AdviserBacktester from "./adviser";
import TraderBacktester from "./trader";
import { saveBacktesterState, saveBacktesterItem } from "../tableStorage";

async function backtest(context, eventData) {
  const backtesterState = {
    ...eventData,
    totalBars: 0,
    processedBars: 0,
    leftBars: 0,
    percent: 0,
    startedAt: dayjs().toJSON(),
    status: STATUS_STARTED
  };
  let adviserBacktester;
  let traderBacktester;
  try {
    context.log.info(`Starting backtest ${eventData.taskId}...`);
    // Создаем экземпляры классов
    adviserBacktester = new AdviserBacktester(context, eventData);
    traderBacktester = new TraderBacktester(context, eventData);
    // Если необходим прогрев
    if (eventData.requiredHistoryCache && eventData.requiredHistoryMaxBars) {
      // Формируем параметры запроса
      const requiredHistoryRequest = {
        exchange: eventData.exchangeId,
        asset: eventData.asset,
        currency: eventData.currency,
        timeframe: eventData.timeframe,
        dateTo: dayjs(eventData.dateFrom).add(-1, "minute"),
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
          "Can't load history required: %s bars but loaded: %s bars",
          eventData.requiredHistoryMaxBars,
          getRequiredHistoryResult.nodes.length
        );
      }
      // Сортируем загруженные свечи в порядке возрастания
      const requiredHistory = getRequiredHistoryResult.nodes.reverse();
      adviserBacktester.setCachedCandles(requiredHistory);
    }
    // Сохраняем начальное состояние
    await saveBacktesterState(backtesterState);
    await publishEvents(context, TASKS_TOPIC, {
      service: BACKTESTER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_BACKTESTER_STARTED_EVENT,
      data: {
        partitionKey: createBacktesterSlug(
          eventData.exchange,
          eventData.asset,
          eventData.currency,
          eventData.timeframe,
          eventData.robotId
        ),
        rowKey: eventData.taskId,
        taskId: eventData.taskId
      }
    });
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
      backtesterState.totalBars = getHistoryCandlesResult.totalCount;

      const historyCandles = getHistoryCandlesResult.nodes;
      // Обрабатываем по очереди
      /* eslint-disable no-restricted-syntax */
      for (const candle of historyCandles) {
        await adviserBacktester.handleCandle(candle);
        await traderBacktester.handlePrice({
          price: candle.close
        });

        for (const event of adviserBacktester.events) {
          await traderBacktester.handleSignal(event.data);
        }
        if (eventData.debug) {
          // Если есть хотя бы одно событие для отправка
          if (adviserBacktester.events.length > 0) {
            // Отправляем
            await publishEvents(
              context,
              SIGNALS_TOPIC,
              adviserBacktester.events
            );
          }
          // Если есть хотя бы одно событие для отправка
          if (traderBacktester.events.length > 0) {
            // Отправляем
            await publishEvents(context, TRADES_TOPIC, traderBacktester.events);
          }
        }
        // Сохраянем состояние итерации
        await saveBacktesterItem({
          taskId: backtesterState.taskId,
          candle,
          adviserEvents: adviserBacktester.events,
          traderEvents: traderBacktester.events
        });

        // Обновляем статистику
        backtesterState.processedBars += 1;
        backtesterState.leftBars =
          backtesterState.totalBars - backtesterState.processedBars;
        backtesterState.percent = Math.round(
          (backtesterState.processedBars / backtesterState.totalBars) * 100
        );
      }
      /* no-restricted-syntax */
      // Сохраняем состояние пачки
      await saveBacktesterState(backtesterState);

      // Формируем новую итерацию обработки
      loadHistoryIteration = {
        ...loadHistoryIteration,
        after: getHistoryCandlesResult.pageInfo.endCursor,
        pageInfo: getHistoryCandlesResult.pageInfo
      };
    }
    // Закончили обработку
    backtesterState.status = STATUS_FINISHED;
    backtesterState.endedAt = dayjs().toJSON();
    // Сохраняем состояние пачки
    await saveBacktesterState(backtesterState);

    await publishEvents(context, TASKS_TOPIC, {
      service: BACKTESTER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_BACKTESTER_FINISHED_EVENT,
      data: {
        taskId: eventData.taskId
      }
    });
    context.log.info(`Backtest ${eventData.taskId} finished!`);
  } catch (error) {
    const err = new VError(
      {
        name: "BacktestError",
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
    if (backtesterState) {
      backtesterState.status = STATUS_ERROR;
      backtesterState.error = errorOutput;
      await saveBacktesterState(backtesterState);
    }
    // Публикуем событие - ошибка
    await publishEvents(context, ERROR_TOPIC, {
      service: BACKTESTER_SERVICE,
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
