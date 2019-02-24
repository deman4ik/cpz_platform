import {
  handleImportStart,
  handleImportStop
} from "../../src/importer/handleTaskEvents";
import { createNewProcess, sendEventToProcess } from "../../src/global";
import {
  createValidator,
  genErrorIfExist
} from "../../../cpz-shared/utils/validation";
import { TASKS_IMPORTER_START_EVENT } from "../../../cpz-shared/config/events/types";

const startEvent = {
  eventType: "CPZ.Tasks.Importer.Start",
  taskId: "12",
  debug: true,
  providerType: "ccxt",
  exchange: "Bitfinex",
  asset: "BTC",
  currency: "ETH",
  timeframes: [5, 15],
  requireBatching: true,
  saveToCache: true,
  dateFrom: "2019-02-17T08:14:02.278Z",
  dateTo: "2019-02-17T10:14:02.278Z",
  proxy: "test"
};

jest.mock("../../src/global");
jest.mock("../../../cpz-shared/utils/validation");
jest.mock("../../../cpz-shared/config/events/types");

/* TODO придумать как реорганизовать код, чтобы его можно было тестировать */

describe("Handle Task Events", () => {
  /*  test("Should correct handle import start", async () => {
    try {
      const result = await handleImportStart(startEvent);
      expect(createValidator).toHaveBeenCalledWith(
        TASKS_IMPORTER_START_EVENT.dataSchema
      );
      const validateStart = jest.fn();
      expect(validateStart).toHaveBeenCalledWith(startEvent);
      expect(genErrorIfExist).toHaveBeenCalledWith();
      genErrorIfExist.mockReturnValue(true);
      expect(createNewProcess).toHaveBeenCalledWith("12");
      expect(sendEventToProcess).toHaveBeenCalledWith(startEvent.taskId, {
        type: "start",
        state: startEvent
      });
      expect(result).toEqual({});
    } catch (e) {
      console.error(e);
    }
  });
  test("Should correct handle import stop", async () => {
    try {
      const result = await handleImportStart(startEvent);
      expect(createValidator).toHaveBeenCalledWith(
        TASKS_IMPORTER_START_EVENT.dataSchema
      );
      createValidator.mockReturnValue(true);
      expect(genErrorIfExist).toHaveBeenCalledWith();
      genErrorIfExist.mockReturnValue(true);
      expect(createNewProcess).toHaveBeenCalledWith("12");
      expect(sendEventToProcess).toHaveBeenCalledWith(startEvent.taskId, {
        type: "stop",
        state: startEvent
      });
      expect(result).toEqual({});
    } catch (e) {
      console.error(e);
    }
  }); */
});
