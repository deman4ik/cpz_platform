import assert from "assert";
import { createValidator, genErrorIfExist } from "../../utils/validation";

const { stringify: str } = JSON;

/**
 * @param {*} value
 * @param {*} schema
 * @param {string} message
 * @param {"throws" | "doesNotThrow"} method
 */
function toValidateAndCheck(
  value,
  schema,
  message = "Didn't throw error",
  method = "throws"
) {
  return assert[method](
    () => genErrorIfExist(createValidator(schema)(value)),
    message
  );
}

describe("genErrorIfExists", () => {
  test("Should throw error if not validated", () => {
    assert.throws(
      () => genErrorIfExist(createValidator({ any: 1 }, { any: "string" })),
      "Didn't throw error"
    );
  });

  test("Shouldn't throw error if validated", () => {
    assert.doesNotThrow(
      () =>
        genErrorIfExist(createValidator({ any: "string" })({ any: "string" })),
      "Threw error"
    );
  });
});

describe("createValidator", () => {
  test("Should validate", () => {
    expect(createValidator({ n: "number" })({ n: 1 })).toEqual(true);
  });
});

describe("Validate dateFrom & dateTo", () => {
  test("Should validates dateTo & dateFrom", () => {
    toValidateAndCheck(
      {
        dateFrom: new Date(1970, 1, 1).toISOString(),
        dateTo: new Date().toISOString()
      },
      { dateFrom: "datefrom", dateTo: "dateto" },
      "Throws error",
      "doesNotThrow"
    );
  });

  test("Should throw error if dateTo less than dateFrom", () => {
    toValidateAndCheck(
      {
        dateFrom: new Date().toISOString(),
        dateTo: new Date(1970, 1, 1).toISOString()
      },
      { dateFrom: "datefrom", dateTo: "dateto" }
    );
  });

  test("Should validate if dateFrom & dateTo have prefix", () => {
    toValidateAndCheck(
      {
        dateFromTest: new Date(1970, 1, 1).toISOString(),
        dateToTest: new Date().toISOString()
      },
      { dateFromTest: "datefrom", dateToTest: "dateto" },
      "Throws error",
      "doesNotThrow"
    );
  });
});

describe("Validate datetime", () => {
  test("Should throw error on incorrect date input", () => {
    toValidateAndCheck({ date: "Tester" }, { date: "datetime" });
  });

  test("Shouldn't throw error on correct date input", () => {
    toValidateAndCheck(
      { date: new Date().toISOString() },
      { date: "datetime" },
      "Throws error",
      "doesNotThrow"
    );
  });
});

describe("Validate currency", () => {
  // inc - incorret
  ["BtC", "eu", "2eu", 2, {}, [], ""].forEach(inc => {
    test(`Should throw error on incorrect currency input: ${str(inc)}`, () => {
      toValidateAndCheck({ val: inc }, { val: "currency" });
    });
  });

  // cor - correct
  ["BTC", "EU", "F", "COZ"].forEach(cor => {
    test(`Shouldn't throw error on correct currency input: ${str(cor)}`, () => {
      toValidateAndCheck(
        { val: cor },
        { val: "currency" },
        "Throws error",
        "doesNotThrow"
      );
    });
  });
});

describe("Validate int", () => {
  [23.23, 0.3, -2.3, 0.0000000000000001, NaN, "Tester", {}, []].forEach(inc => {
    test(`Should throw error on incorrect int input: ${str(inc)}`, () => {
      toValidateAndCheck({ val: inc }, { val: "int" });
    });
  });

  [1, 0, -1].forEach(cor => {
    test(`Shouldn't throw error on correct int input: ${str(cor)}`, () => {
      toValidateAndCheck(
        { val: cor },
        { val: "int" },
        "Throws error",
        "doesNotThrow"
      );
    });
  });
});

describe("Validate exchange", () => {
  [1, {}, [], "Uppercase", "Incorrect( )symbols", "/|\\", ""].forEach(inc => {
    test(`Should throw error on incorrect exchange input: ${str(inc)}`, () => {
      toValidateAndCheck({ val: inc }, { val: "exchange" });
    });
  });

  ["test_", "_test_", "23____", "_", "f1"].forEach(cor => {
    test(`Shouldn't throw error on correct exchange input: ${str(cor)}`, () => {
      toValidateAndCheck(
        { val: cor },
        { val: "exchange" },
        "Throws error",
        "doesNotThrow"
      );
    });
  });
});

describe("Validate posInt", () => {
  [23.23, 0.3, -2.3, 0.00000000001, NaN, "Tester", {}, [], -1].forEach(inc => {
    test(`Should throw error on incorrect posInt input: ${str(inc)}`, () => {
      toValidateAndCheck({ val: inc }, { val: "posInt" });
    });
  });

  [1, 0].forEach(cor => {
    test(`Shouldn't throw error on correct posInt input: ${str(cor)}`, () => {
      toValidateAndCheck(
        { val: cor },
        { val: "posInt" },
        "Throws error",
        "doesNotThrow"
      );
    });
  });
});
