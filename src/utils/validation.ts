import * as E from "fp-ts/lib/Either.js";
import type { ValidationError } from "../types/index.js";
import { createValidationError } from "./errors.js";

export const validateFilename = (
  filename: string
): E.Either<ValidationError, string> => {
  if (!filename) return E.left(createValidationError("No filename provided"));
  if (typeof filename !== "string")
    return E.left(createValidationError("Filename must be a string"));
  if (filename.trim().length === 0)
    return E.left(createValidationError("Filename cannot be empty"));
  return E.right(filename);
};
