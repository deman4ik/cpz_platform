import Log from "../../log";
import { contextMock } from "../../../tests/helpers";

jest.mock("applicationinsights");

describe("Log helper should log data", () => {
  test("Should set default mode values", () => {
    expect(Log._appInstightsEnabled).toBeFalsy();
  });
  test("Should log info to console", () => {
    const spy = jest.spyOn(Log, "_logInfo");
    Log.info("info");
    expect(spy).toHaveBeenCalled();
  });
  test("Should log warn to console", () => {
    const spy = jest.spyOn(Log, "_logWarn");
    Log.warn("warn");
    expect(spy).toHaveBeenCalled();
  });
  test("Should log error to console", () => {
    const spy = jest.spyOn(Log, "_logError");
    Log.error("error");
    expect(spy).toHaveBeenCalled();
  });

  test("Should throw error for invalid context", () => {
    const context = {};
    expect(() => {
      Log.addContext(context);
    }).toThrow();
  });
  test("Should log info to context.info", () => {
    const context = contextMock();
    const spy = jest.spyOn(context.log, "info");
    Log.addContext(context);
    Log.info("info");
    expect(spy).toHaveBeenCalled();
  });
  test("Should log warn to context.warn", () => {
    const context = contextMock();
    const spy = jest.spyOn(context.log, "warn");
    Log.addContext(context);
    Log.warn("warn");
    expect(spy).toHaveBeenCalled();
  });
  test("Should log error to context.error", () => {
    const context = contextMock();
    const spy = jest.spyOn(context.log, "error");
    Log.addContext(context);
    Log.error("error");
    expect(spy).toHaveBeenCalled();
  });
  // TODO: AppInsights related tests
});
