import * as E from "fp-ts/lib/Either.js";
import * as O from "fp-ts/lib/Option.js";
import type { AppError } from "../types/index.js";

const handleError =
  <T>(errorHandler: (error: AppError) => T) =>
  (result: E.Either<AppError, T>): T =>
    result._tag === "Left" ? errorHandler(result.left) : result.right;

const mapError =
  (errorMapper: (error: AppError) => AppError) =>
  <T>(result: E.Either<AppError, T>): E.Either<AppError, T> =>
    result._tag === "Left" ? E.left(errorMapper(result.left)) : result;

const safeOperation =
  <T, R>(operation: (input: T) => R) =>
  (input: T): E.Either<AppError, R> => {
    try {
      return E.right(operation(input));
    } catch (error) {
      return E.left({
        type: "FileError",
        message: `Operation failed: ${(error as Error).message}`,
      } as AppError);
    }
  };

const recoverWith =
  <T>(fallback: T) =>
  (result: E.Either<AppError, T>): E.Either<AppError, T> =>
    result._tag === "Left" ? E.right(fallback) : result;

const retry =
  (maxAttempts: number) =>
  <T>(operation: (input: T) => Promise<E.Either<AppError, T>>) =>
  async (input: T): Promise<E.Either<AppError, T>> => {
    let attempts = 0;
    let lastError: AppError | undefined;
    while (attempts < maxAttempts) {
      const result = await operation(input);
      if (result._tag === "Right") return E.right(result.right);
      lastError = result.left;
      attempts++;
    }
    return E.left(lastError!);
  };

const toOption = <T>(result: E.Either<AppError, T>): O.Option<T> =>
  result._tag === "Right" ? O.some(result.right) : O.none;

const fromOption = <T>(
  option: O.Option<T>,
  errorMessage: string
): E.Either<AppError, T> =>
  option._tag === "Some"
    ? E.right(option.value)
    : E.left({ type: "ValidationError", message: errorMessage } as AppError);

const safeCompose =
  <T>(...operations: Array<(input: T) => Promise<E.Either<AppError, T>>>) =>
  async (input: T): Promise<E.Either<AppError, T>> => {
    let current: E.Either<AppError, T> = E.right(input);
    for (const operation of operations) {
      if (current._tag === "Left") return current;
      const result = await operation(current.right);
      if (result._tag === "Left") return result;
      current = result;
    }
    return current;
  };

export {
  handleError,
  mapError,
  safeOperation,
  recoverWith,
  retry,
  toOption,
  fromOption,
  safeCompose,
};
