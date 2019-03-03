import VError from "verror";
import { ServiceError } from "../../utils/error";

const { stringify: str } = JSON;

describe("ServiceError", () => {
  test("Should be instance of VError", () => {
    expect(new ServiceError()).toBeInstanceOf(VError);
  });

  test("Should be instance of Error", () => {
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

  describe("stack", () => {
    test("static method 'getStackNames'", () => {
      const stack =
        "AdviserExecutionError: Failed to execute adviser\nAdviserSaveError: Failed to save adviser taskId:'12345678' state\nStorageError: Failed to load from 'advisers' table";

      const error = new ServiceError(
        {
          name: "AdviserExecutionError",
          $$toCheck: false,
          cause: new ServiceError(
            {
              name: "AdviserSaveError",
              $$toCheck: false,
              cause: new ServiceError(
                {
                  name: "StorageError",
                  $$toCheck: false
                },
                "Failed to load from 'advisers' table"
              )
            },
            "Failed to save adviser taskId:'12345678' state"
          )
        },
        "Failed to execute adviser"
      );
      const result = ServiceError.getStackNames(error);
      expect(result).toStrictEqual(stack);
    });

    test("static method 'getStack'", () => {
      const stack = [
        { name: "AdviserExecutionError", message: "Failed to execute adviser" },

        {
          name: "AdviserSaveError",
          message: "Failed to save adviser taskId:'12345678' state"
        },

        {
          name: "StorageError",
          message: "Failed to load from 'advisers' table"
        }
      ];
      const error = new ServiceError(
        {
          name: "AdviserExecutionError",
          $$toCheck: false,
          cause: new ServiceError(
            {
              name: "AdviserSaveError",
              $$toCheck: false,
              cause: new ServiceError(
                {
                  name: "StorageError",
                  $$toCheck: false
                },
                "Failed to load from 'advisers' table"
              )
            },
            "Failed to save adviser taskId:'12345678' state"
          )
        },
        "Failed to execute adviser"
      );
      const result = ServiceError.getStack(error);

      expect(result).toStrictEqual(stack);
    });
  });

  describe("format", () => {
    describe("static method 'formatError'", () => {
      test("Default pattern should be mutable", () => {
        const error = new ServiceError(
          {
            name: "SomeError",
            info: { info: "some_info" },
            cause: new Error("some_message"),
            $$toCheck: false
          },
          "some_message"
        );

        ServiceError.$$defaultFormatPattern =
          "n: {name}\nm: {message}\ni: {info}\ns: {stack}";

        const result = ServiceError.formatError(error);

        expect(result).toEqual(
          `n: ${error.name}\nm: ${error.jse_shortmsg}\ni: ${str(
            VError.info(error)
          )}\ns: SomeError: some_message\nError: some_message`
        );
      });

      test("Should return correct result", () => {
        const error = new ServiceError(
          {
            name: "SomeError",
            info: { info: "some_info" },
            cause: new Error("some_message"),
            $$toCheck: false
          },
          "some_message"
        );

        const result = ServiceError.formatError(
          error,
          "n: {name}\nm: {message}\ni: {info}\ns: {stack}"
        );

        expect(result).toEqual(
          `n: ${error.name}\nm: ${error.jse_shortmsg}\ni: ${str(
            VError.info(error)
          )}\ns: SomeError: some_message\nError: some_message`
        );
      });
    });

    describe("method 'format'", () => {
      test("Should return correct result", () => {
        const error = new ServiceError(
          {
            name: "SomeError",
            info: { info: "some_info" },
            cause: new Error("some_message"),
            $$toCheck: false
          },
          "some_message"
        );

        const result = error.format(
          "n: {name}\nm: {message}\ni: {info}\ns: {stack}"
        );

        expect(result).toEqual(
          `n: ${error.name}\nm: ${error.jse_shortmsg}\ni: ${str(
            error.info
          )}\ns: SomeError: some_message\nError: some_message`
        );
      });

      test("Default pattern should be mutable", () => {
        const error = new ServiceError(
          {
            name: "SomeError",
            info: { info: "some_info" },
            cause: new Error("some_message"),
            $$defaultFormatPattern:
              "n: {name}\nm: {message}\ni: {info}\ns: {stack}",
            $$toCheck: false
          },
          "some_message"
        );

        const result = error.format();

        expect(result).toEqual(
          `n: ${error.name}\nm: ${error.jse_shortmsg}\ni: ${str(
            error.info
          )}\ns: SomeError: some_message\nError: some_message`
        );
      });
    });

    describe("method 'toString'", () => {
      test("Work with mutable default pattern", () => {
        const error = new ServiceError(
          {
            name: "SomeError",
            info: { info: "some_info" },
            cause: new Error("some_message"),
            $$defaultFormatPattern:
              "n: {name}\nm: {message}\ni: {info}\ns: {stack}",
            $$toCheck: false
          },
          "some_message"
        );

        const result = error.toString();

        expect(result).toEqual(
          `n: ${error.name}\nm: ${error.jse_shortmsg}\ni: ${str(
            error.info
          )}\ns: SomeError: some_message\nError: some_message`
        );
      });
    });
  });
  describe("json", () => {
    test("Should return json object", () => {
      const json = {
        name: "AdviserExecutionError",
        message: "Failed to execute adviser",
        info: { table: "advisers", taskId: "12345678" },
        stack: [
          {
            name: "AdviserExecutionError",
            message: "Failed to execute adviser"
          },

          {
            name: "AdviserSaveError",
            message: "Failed to save adviser taskId:'12345678' state"
          },

          {
            name: "StorageError",
            message: "Failed to load from 'advisers' table"
          }
        ]
      };
      const error = new ServiceError(
        {
          name: "AdviserExecutionError",
          $$toCheck: false,
          cause: new ServiceError(
            {
              name: "AdviserSaveError",
              $$toCheck: false,
              cause: new ServiceError(
                {
                  name: "StorageError",
                  info: { table: "advisers" },
                  $$toCheck: false
                },
                "Failed to load from 'advisers' table"
              ),
              info: { taskId: "12345678" }
            },
            "Failed to save adviser taskId:'12345678' state"
          )
        },
        "Failed to execute adviser"
      );
      expect(error.json).toStrictEqual(json);
    });
  });
});
