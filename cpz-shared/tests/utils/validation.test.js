import assert from "assert";
import { createValidator, genErrorIfExist } from "../../utils/validation";

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
