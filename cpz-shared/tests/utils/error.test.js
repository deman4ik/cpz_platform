import VError from "verror";
import { ServiceError } from "../../utils/error";

const { stringify: str } = JSON;

describe("ServiceError", () => {
  test("Should instade of VError", () => {
    expect(new ServiceError()).toBeInstanceOf(VError);
  });

  test("Should instede of Error", () => {
    expect(new ServiceError()).toBeInstanceOf(Error);
  });

  test("Should create new cause if incorrect error name", () => {
    const name = "DoesNotExistsErrorIThinkSo";
    const error = new ServiceError({ name });

    expect(error.cause().name).toEqual(name);
  });

  describe("static method 'isModifiedError'", () => {
    test("Should return false for isn't insted object", () => {
      const error = new Error();

      const result = ServiceError.isModifiedError(error);

      expect(result).toBeFalsy();
    });

    test("Should return true for VError", () => {
      const error = new VError();

      const result = ServiceError.isModifiedError(error);

      expect(result).toBeTruthy();
    });

    test("Should return true for ServiceError", () => {
      const error = new ServiceError();

      const result = ServiceError.isModifiedError(error);

      expect(result).toBeTruthy();
    });
  });

  describe("Additive getter queries", () => {
    test("Should return fullStack", () => {
      const error = new ServiceError({ cause: new Error() });

      expect(error.fullStack).toStrictEqual(VError.fullStack(error));
    });

    test("Should return info", () => {
      const info = { some: "some_info" };

      const error = new ServiceError({ info });

      expect(error.info).toStrictEqual(info);
    });
  });

  describe("stackNames", () => {
    test("method 'getStackNames'", () => {
      const stackNames = ["root", "pre-sheet", "sheet"];

      const result = new ServiceError({
        name: stackNames[2],
        $$toCheck: false,
        cause: new ServiceError({
          name: stackNames[1],
          $$toCheck: false,
          cause: new ServiceError({
            name: stackNames[0],
            $$toCheck: false
          })
        })
      }).getStackNames();

      expect(result).toStrictEqual(stackNames);
    });

    test("static method 'getStackNamesError'", () => {
      const stackNames = ["root", "pre-sheet", "sheet"];

      const result = ServiceError.getStackNamesError(
        new ServiceError({
          name: stackNames[2],
          $$toCheck: false,
          cause: new ServiceError({
            name: stackNames[1],
            $$toCheck: false,
            cause: new ServiceError({
              name: stackNames[0],
              $$toCheck: false
            })
          })
        })
      );

      expect(result).toStrictEqual(stackNames);
    });
  });

  describe("format", () => {
    describe("static method 'formatError'", () => {
      test("Default pattern should be mutable", () => {
        const error = new ServiceError({
          message: "some_message",
          name: "SomeError",
          info: { info: "some_info" },
          cause: new Error("some_message"),
          $$toCheck: false
        });

        ServiceError.$$defaultFormatPattern =
          "n: {name}\nm: {message}\ni: {info}\ns: {stack}";

        const result = ServiceError.formatError(error);

        expect(result).toEqual(
          `n: ${error.name}\nm: ${error.message}\ni: ${str(
            VError.info(error)
          )}\ns: ${VError.fullStack(error)}`
        );
      });

      test("Should return correct result", () => {
        const error = new ServiceError({
          message: "some_message",
          name: "SomeError",
          info: { info: "some_info" },
          cause: new Error("some_message"),
          $$toCheck: false
        });

        const result = ServiceError.formatError(
          error,
          "n: {name}\nm: {message}\ni: {info}\ns: {stack}"
        );

        expect(result).toEqual(
          `n: ${error.name}\nm: ${error.message}\ni: ${str(
            VError.info(error)
          )}\ns: ${VError.fullStack(error)}`
        );
      });
    });

    describe("method 'format'", () => {
      test("Should return correct result", () => {
        const error = new ServiceError({
          message: "some_message",
          name: "SomeError",
          info: { info: "some_info" },
          cause: new Error("some_message"),
          $$toCheck: false
        });

        const result = error.format(
          "n: {name}\nm: {message}\ni: {info}\ns: {stack}"
        );

        expect(result).toEqual(
          `n: ${error.name}\nm: ${error.message}\ni: ${str(error.info)}\ns: ${
            error.fullStack
          }`
        );
      });

      test("Default pattern should be mutable", () => {
        const error = new ServiceError({
          message: "some_message",
          name: "SomeError",
          info: { info: "some_info" },
          cause: new Error("some_message"),
          $$defaultFormatPattern:
            "n: {name}\nm: {message}\ni: {info}\ns: {stack}",
          $$toCheck: false
        });

        const result = error.format();

        expect(result).toEqual(
          `n: ${error.name}\nm: ${error.message}\ni: ${str(error.info)}\ns: ${
            error.fullStack
          }`
        );
      });
    });

    describe("method 'toString'", () => {
      test("Work with mutable default pattern", () => {
        const error = new ServiceError({
          message: "some_message",
          name: "SomeError",
          info: { info: "some_info" },
          cause: new Error("some_message"),
          $$defaultFormatPattern:
            "n: {name}\nm: {message}\ni: {info}\ns: {stack}",
          $$toCheck: false
        });

        const result = error.toString();

        expect(result).toEqual(
          `n: ${error.name}\nm: ${error.message}\ni: ${str(error.info)}\ns: ${
            error.fullStack
          }`
        );
      });
    });
  });
});
