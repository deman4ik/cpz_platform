import {
  SUB_DELETED_EVENT,
  SUB_VALIDATION_EVENT,
  SIGNALS_NEWSIGNAL_EVENT
} from "cpzEventTypes";
import funcTaskEvents from "../../src/funcs/funcSignalEvents";

import { contextMock, reqMock } from "../../../tests/helpers";

jest.mock("cpzUtils/validation", () => ({
  createValidator: () => () => true,
  genErrorIfExist: () => true
}));
jest.mock("cpzEnv");

jest.mock("../../../cpz-shared/tableStorage/tableStorage");

jest.mock("../../src/trader/handleSignalEvents", () => ({
  __esModule: true,
  default: context => {
    context.handleSignal = true;
  }
}));

describe("Should show correct messages and return correct objects", () => {
  const validationCode = "*some_code*";

  const data = { validationCode };

  const body = [{ data, eventType: SIGNALS_NEWSIGNAL_EVENT.eventType }];

  test("Should be done", () => {
    const req = reqMock(body);
    const context = contextMock();

    funcTaskEvents(context, req);

    expect(context.done.called).toEqual(true);
  });

  test("Should call all handlers", () => {
    const req = reqMock(body);
    const context = contextMock();

    funcTaskEvents(context, req);

    const { handleSignal } = context;

    expect(handleSignal).toEqual(true);
  });

  test("Should go to error", () => {
    const req = reqMock([{ eventType: "DoestNotExistType" }]);
    const context = contextMock();

    funcTaskEvents(context, req);

    expect(context.log.error.cache.length).toEqual(1);
  });

  test("SUB events should work", () => {
    const req = reqMock([
      { eventType: SUB_VALIDATION_EVENT.eventType, data },
      { eventType: SUB_DELETED_EVENT.eventType, data }
    ]);
    const context = contextMock();

    funcTaskEvents(context, req);

    expect({
      warnLen: context.log.warn.cache.length,
      res: context.res
    }).toStrictEqual({
      warnLen: 2,
      res: {
        status: 200,
        body: {
          validationResponse: validationCode
        },
        headers: {
          "Content-Type": "application/json"
        }
      }
    });
  });
});
