import * as E from "fp-ts/lib/Either.js";
import type { FileError } from "../types/index.js";
import { createFileError } from "./errors.js";

const withFsEither = async <T>(
  operation: (fs: any) => T,
  context: string
): Promise<E.Either<FileError, T>> => {
  try {
    const fs = await import("fs");
    return E.right(operation(fs));
  } catch (error) {
    return E.left(createFileError(`${context}: ${(error as Error).message}`));
  }
};

export const safeReadFile = async (
  filename: string
): Promise<E.Either<FileError, string>> =>
  withFsEither(
    (fs) => fs.readFileSync(filename, "utf8"),
    `Failed to read ${filename}`
  );

export const safeFileExists = async (
  filename: string
): Promise<E.Either<FileError, boolean>> =>
  withFsEither(
    (fs) => fs.existsSync(filename),
    "Failed to check file existence"
  );
