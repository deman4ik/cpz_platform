import {
  SUB_VALIDATION_EVENT,
  SUB_DELETED_EVENT,
  TASKS_CANDLEBATCHER_START_EVENT,
  TASKS_CANDLEBATCHER_STOP_EVENT,
  TASKS_CANDLEBATCHER_UPDATE_EVENT
} from "cpzEventTypes";
import funcTaskEvents from "../../src/funcs/funcTaskEvents";

import { contextMock, reqMock } from "../../../tests/helpers";

jest.mock("cpzEnv");
jest.mock("cpzUtils/environment");
jest.mock("../../../cpz-shared/tableStorage/tableStorage.js");
jest.mock("../../src/batcher/handleTaskEvents");

const { stringify: str } = JSON;

describe("funcTaskEvents should show correct messages and return correct objects", () => {
  const context = contextMock();

  const topic = "TOPIC";
  const validationCode = "none";
  const data = { validationCode };
  const id = "Test";
  const subject = "subjest";
  const eventTime = new Date().toISOString();

  const body = [
    {
      id,
      topic,
      subject,
      data,
      eventType: SUB_DELETED_EVENT.eventType,
      eventTime,
      metadataVersion: "0.0.0",
      dataVersion: "0.0.0"
    },
    {
      id,
      topic,
      subject,
      data,
      eventType: SUB_VALIDATION_EVENT.eventType,
      eventTime,
      metadataVersion: "0.0.0",
      dataVersion: "0.0.0"
    },
    {
      id,
      topic,
      subject,
      data,
      eventType: TASKS_CANDLEBATCHER_START_EVENT.eventType,
      eventTime,
      metadataVersion: "0.0.0",
      dataVersion: "0.0.0"
    },
    {
      id,
      topic,
      subject,
      data,
      eventType: TASKS_CANDLEBATCHER_STOP_EVENT.eventType,
      eventTime,
      metadataVersion: "0.0.0",
      dataVersion: "0.0.0"
    },
    {
      id,
      topic,
      subject,
      data,
      eventType: TASKS_CANDLEBATCHER_UPDATE_EVENT.eventType,
      eventTime,
      metadataVersion: "0.0.0",
      dataVersion: "0.0.0"
    }
  ];

  const req = reqMock(body);

  funcTaskEvents(context, req);

  test("Should be done", () => {
    expect(context.done.called).toEqual(true);
  });

  describe("info", () => {
    test("Infos should be computable", () => {
      expect(context.log.info.cache).toStrictEqual([
        `CPZ Candlebatcher processed a request.${str(body)}`,
        `Got ${TASKS_CANDLEBATCHER_START_EVENT.eventType} event data ${str(
          data
        )}`,
        `Got ${TASKS_CANDLEBATCHER_STOP_EVENT.eventType} event data ${str(
          data
        )}`,
        `Got ${TASKS_CANDLEBATCHER_UPDATE_EVENT.eventType} event data ${str(
          data
        )}`
      ]);
    });
  });

  describe("error", () => {
    test("Shouldn't have errors", () => {
      expect(context.log.error.cache).toEqual(undefined);
    });

    const doesNotExistsType = "NOT_EXISTS_TYPE_TEST_ERROR";

    const errorCtx = contextMock();
    const errorReq = reqMock([
      {
        id,
        topic,
        subject,
        data,
        eventType: doesNotExistsType,
        eventTime,
        metadataVersion: "0.0.0",
        dataVersion: "0.0.0"
      }
    ]);

    funcTaskEvents(errorCtx, errorReq);
    test("Should be 1 error with doesn't exist type", () => {
      expect(errorCtx.log.error.cache.length).toEqual(1);
    });

    test("Error should be computable", () => {
      expect(errorCtx.log.error.cache).toStrictEqual([
        `Unknown Event Type: ${doesNotExistsType}`
      ]);
    });
  });

  describe("res", () => {
    test("Result should be computable", () => {
      expect(context.res).toStrictEqual({
        status: 200,
        body: { validationResponse: validationCode },
        headers: { "Content-Type": "application/json" }
      });
    });
  });

  describe("warn", () => {
    test("Should includes 2 warns", () => {
      expect(context.log.warn.cache.length).toEqual(2);
    });

    test("Warns should be computable", () => {
      expect(context.log.warn.cache).toStrictEqual([
        `Got SubscriptionDeletedEvent event data, topic: ${topic}`,
        `Got SubscriptionValidation event data, validationCode: ${validationCode}, topic: ${topic}`
      ]);
    });
  });
});
