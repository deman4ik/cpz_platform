import azure from "azure-storage";
import VError from "verror";
import dayjs from "cpzDayjs";
import { createCandlebatcherSlug } from "cpzState";
import tableStorage from "cpzStorage";

import { modeToStr, chunkArray } from "cpzUtils/helpers";
import { STORAGE_TICKSCACHED_TABLE } from "cpzStorageTables";

const { TableQuery, TableUtilities } = azure;

// Создать таблицы если не существуют
tableStorage.createTableIfNotExists(STORAGE_TICKSCACHED_TABLE);

/**
 * Удаление тиков ожидающей выполнения
 *
 * @param {Array} ticks
 */
async function deletePrevCachedTicksArray(ticks) {
  try {
    const chunks = chunkArray(ticks, 100);
    await Promise.all(
      chunks.map(async chunk => {
        const batch = new azure.TableBatch();
        chunk.forEach(tick => {
          batch.deleteEntity(tableStorage.objectToEntity(tick));
        });
        await tableStorage.executeBatch(STORAGE_TICKSCACHED_TABLE, batch);
      })
    );
  } catch (error) {
    throw new VError(
      {
        name: "CandlebatcherStorageError",
        cause: error
      },
      'Failed to delete ticks from "%s"',
      STORAGE_TICKSCACHED_TABLE
    );
  }
}

async function getPrevCachedTicks(input) {
  try {
    const {
      dateFrom,
      dateTo,
      exchange,
      asset,
      currency,
      mode,
      modeStr
    } = input;
    const dateFromFilter = TableQuery.dateFilter(
      "timestamp",
      TableUtilities.QueryComparisons.GREATER_THAN_OR_EQUAL,
      dayjs(dateFrom).toDate()
    );
    const dateToFilter = TableQuery.dateFilter(
      "timestamp",
      TableUtilities.QueryComparisons.LESS_THAN_OR_EQUAL,
      dayjs(dateTo).toDate()
    );
    const dateFilter = TableQuery.combineFilters(
      dateFromFilter,
      TableUtilities.TableOperators.AND,
      dateToFilter
    );
    const slug = createCandlebatcherSlug(
      exchange,
      asset,
      currency,
      modeStr || modeToStr(mode)
    );
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      slug
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        dateFilter,
        TableUtilities.TableOperators.AND,
        partitionKeyFilter
      )
    );
    return await tableStorage.queryEntities(STORAGE_TICKSCACHED_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "ImporterStorageError",
        cause: error,
        info: input
      },
      "Failed to load previous ticks"
    );
  }
}

export { deletePrevCachedTicksArray, getPrevCachedTicks };
