import {
  SUB_DELETED_EVENT,
  SUB_VALIDATION_EVENT,
  TASKS_MARKETWATCHER_START_EVENT,
  TASKS_MARKETWATCHER_STOP_EVENT,
  TASKS_MARKETWATCHER_SUBSCRIBE_EVENT as SUB,
  TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT as UNSUB
} from "cpzEventTypes";
import funcTaskEvents from "../../src/routes/taskEvents";

import { reqMock, resMock, logMock } from "../../../tests/helpers";

jest.mock("cpzEnv");
jest.mock("../../../cpz-shared/tableStorage/tableStorage");
jest.mock("../../src/marketwatcher/handleTaskEvents", () => ({
  handleStart: ({ eventSubject }) => {
    Object.assign(eventSubject, { handleStart: true });
  },
  handleStop: ({ eventSubject }) => {
    Object.assign(eventSubject, { handleStop: true });
  },
  handleSubscribe: ({ eventSubject }) => {
    Object.assign(eventSubject, { handleSubscribe: true });
  },
  handleUnsubscribe: ({ eventSubject }) => {
    Object.assign(eventSubject, { handleUnsubscribe: true });
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
    { data, subject: {}, eventType: TASKS_MARKETWATCHER_START_EVENT },
    { data, subject: {}, eventType: TASKS_MARKETWATCHER_STOP_EVENT },
    { data, subject: {}, eventType: SUB },
    { data, subject: {}, eventType: UNSUB }
  ]);

  const res = resMock();

  funcTaskEvents(req, res);

  const [
    { subject: { handleStart: start } = {} },
    { subject: { handleStop: stop } = {} },
    { subject: { handleSubscribe: sub } = {} },
    { subject: { handleUnsubscribe: unsub } = {} }
  ] = req.body;

  expect({ start, stop, sub, unsub }).toStrictEqual({
    start: true,
    stop: true,
    sub: true,
    unsub: true
  });
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
    { eventType: SUB_VALIDATION_EVENT, data },
    { eventType: SUB_DELETED_EVENT, data }
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
