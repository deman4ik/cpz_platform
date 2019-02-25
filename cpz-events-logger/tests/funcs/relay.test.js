import { EVENTS_LOGGER_SERVICE } from "cpzServices";
import retry from "cpzUtils/retry";
import Relay from "../../src/emulator/relay";
import { contextMock } from "../../../tests/helpers";

jest.mock("node-fetch");
jest.mock("cpzUtils/retry");
const context = contextMock();
describe("Should to relay incoming events to local services", () => {
  test("Should be instance of Relay", () => {
    const relay = new Relay(false, "test");
    expect(relay).toBeInstanceOf(Relay);
  });
  test("Init method", () => {
    const spy = jest.spyOn(Relay.prototype, "_init");
    const relay = new Relay(true, "test");
    expect(spy).toHaveBeenCalled();
    expect(relay._endpoints.length).toBeGreaterThan(0);
    expect(
      relay._endpoints.filter(
        ({ service }) => service === EVENTS_LOGGER_SERVICE
      )
    ).toEqual([]);
  });
  test("Should return endpoints for event type", () => {
    const relay = new Relay(true, "test");
    const endpoints = relay._findEndpoints("CPZ.Candles.NewCandle");
    expect(endpoints).toEqual([
      {
        service: "adviser",
        url: "http://localhost:8104/api/candleEvents?api-key=test",
        types: ["CPZ.Candles.NewCandle"]
      },
      {
        service: "trader",
        url: "http://localhost:8106/api/candleEvents?api-key=test",
        types: ["CPZ.Candles.NewCandle"]
      }
    ]);
  });
  test("Should return docker endpoints for event type", () => {
    const relay = new Relay("docker", "test");
    const endpoints = relay._findEndpoints("CPZ.Candles.NewCandle");
    expect(endpoints).toEqual([
      {
        service: "adviser",
        url: "http://cpz-adviser:80/api/candleEvents?api-key=test",
        types: ["CPZ.Candles.NewCandle"]
      },
      {
        service: "trader",
        url: "http://cpz-trader:80/api/candleEvents?api-key=test",
        types: ["CPZ.Candles.NewCandle"]
      }
    ]);
  });
  test("Should send events", async () => {
    const relay = new Relay(true, "test");
    expect.assertions(1);
    await relay.send(context, {
      id: "968a8f13-bd77-40d8-ba83-5cf4364ec2a9",
      topic:
        "/subscriptions/785b39f5-bf28-45bd-b2a3-65beea8e153e/resourceGroups/cpz/providers/Microsoft.EventGrid/topics/cpz-test-topic",
      subject: "kraken",
      data: {
        taskId: "3984389d-acf8-43f0-9299-307fb1a7ee30"
      },
      eventType: "CPZ.Tasks.Marketwatcher.Stop",
      eventTime: "2018-10-09T15:12:33.859Z",
      metadataVersion: "1",
      dataVersion: "1.0"
    });
    expect(retry.mock.calls.length).toBe(1);
  });
  test("Should not send events if disabled", async () => {
    const relay = new Relay(false, "test");
    expect.assertions(1);
    await relay.send(context, {
      id: "968a8f13-bd77-40d8-ba83-5cf4364ec2a9",
      topic:
        "/subscriptions/785b39f5-bf28-45bd-b2a3-65beea8e153e/resourceGroups/cpz/providers/Microsoft.EventGrid/topics/cpz-test-topic",
      subject: "kraken",
      data: {
        taskId: "3984389d-acf8-43f0-9299-307fb1a7ee30"
      },
      eventType: "CPZ.Tasks.Marketwatcher.Stop",
      eventTime: "2018-10-09T15:12:33.859Z",
      metadataVersion: "1",
      dataVersion: "1.0"
    });
    expect(retry.mock.calls.length).toBe(0);
  });
  test("Should not send events for wrong event types", async () => {
    const relay = new Relay(true, "test");
    expect.assertions(1);
    await relay.send(context, {
      eventType: "CPZ.Tasks.Marketwatcher.Stop!"
    });
    expect(retry.mock.calls.length).toBe(0);
  });
});
