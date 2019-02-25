import {
  SUB_DELETED_EVENT,
  SUB_VALIDATION_EVENT,
  TASKS_BACKTESTER_START_EVENT,
  TASKS_BACKTESTER_STOP_EVENT
} from "cpzEventTypes";
import funcTaskEvents from "../../src/routes/taskEvents";

import { reqMock, resMock, logMock } from "../../../tests/helpers";

jest.mock("cpzEnv");
jest.mock("../../../cpz-shared/tableStorage/tableStorage");
jest.mock("../../src/backtester/handleTaskEvents", () => ({
  handleStart: ({ eventSubject }) => {
    Object.assign(eventSubject, { handleStart: true });
  },
  handleStop: ({ eventSubject }) => {
    Object.assign(eventSubject, { handleStop: true });
  }
}));

jest.mock("cpzUtils/validation", () => ({
  createValidator: () => () => true,
  genErrorIfExist: () => true
}));

Object.assign(console, logMock());

beforeEach(() => {
  console.log.cache = [];
  console.warn.cache = [];
  console.error.cache = [];
});

const validationCode = "*some_code*";

const data = { validationCode };

test("Should call all handlers", () => {
  const req = reqMock([
    { data, subject: {}, eventType: TASKS_BACKTESTER_START_EVENT.eventType },
    { data, subject: {}, eventType: TASKS_BACKTESTER_STOP_EVENT.eventType }
  ]);

  const res = resMock();

  funcTaskEvents(req, res);

  const [
    { subject: { handleStart: start } = {} },
    { subject: { handleStop: stop } = {} }
  ] = req.body;

  expect({ start, stop }).toStrictEqual({ start: true, stop: true });
});

test("Should go to error", () => {
  const res = resMock();
  const req = reqMock([{ eventType: "DoestNotExistType" }]);

  funcTaskEvents(req, res);

  expect(console.error.cache.length).toEqual(1);
});

test("SUB events should work", () => {
  const res = resMock();
  const req = reqMock([
    { eventType: SUB_VALIDATION_EVENT.eventType, data },
    { eventType: SUB_DELETED_EVENT.eventType, data }
  ]);

  funcTaskEvents(req, res);

  expect({
    warnLen: console.warn.cache.length,
    status: res.status.cache,
    res: res.send.cache
  }).toStrictEqual({
    warnLen: 2,
    status: [200, 200],
    res: [{ validationResponse: validationCode }]
  });
});
