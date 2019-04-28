import {
  SUB_DELETED_EVENT,
  SUB_VALIDATION_EVENT,
  TASKS_ADVISER_START_EVENT,
  TASKS_ADVISER_STOP_EVENT,
  TASKS_ADVISER_UPDATE_EVENT
} from "cpzEventTypes";
import funcTaskEvents from "../../src/funcs/funcEvents";

import { contextMock, reqMock } from "../../../tests/helpers";

jest.mock("cpzUtils/validation", () => ({
  createValidator: () => () => true,
  genErrorIfExist: () => true
}));
jest.mock("cpzEnv/advister");
jest.mock("../../../cpz-shared/tableStorage/tableStorage");

describe("Should show correct messages and return correct objects", () => {
  const validationCode = "*some_code*";

  const data = { validationCode };

  const body = [
    { data, eventType: TASKS_ADVISER_START_EVENT },
    { data, eventType: TASKS_ADVISER_STOP_EVENT },
    { data, eventType: TASKS_ADVISER_UPDATE_EVENT }
  ];

  test("Should be done", () => {
    const req = reqMock(body);
    const context = contextMock();

    funcTaskEvents(context, req);

    expect(context.done.called).toEqual(true);
  });

  test("Should go to error", () => {
    const req = reqMock([]);
    // That part create the error (JSON.parse([object Object]))
    req.rawBody = JSON.parse(req.rawBody);

    const context = contextMock();

    funcTaskEvents(context, req);

    expect(context.log.error.cache.length).toEqual(1);
  });

  test("SUB events should work", () => {
    const req = reqMock([
      { eventType: SUB_VALIDATION_EVENT, data },
      { eventType: SUB_DELETED_EVENT, data }
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
