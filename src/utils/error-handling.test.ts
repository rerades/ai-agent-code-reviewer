import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as E from "fp-ts/lib/Either.js";
import {
  createFileError,
  createValidationError,
  createAIError,
  createNetworkError,
  safeReadFile,
  safeFileExists,
  formatError,
} from "./error-handling.js";
import { safeOperation } from "./either-utils.js";

describe("error-handling utils", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates ADT errors", () => {
    expect(createFileError("x")).toEqual({ type: "FileError", message: "x" });
    expect(createValidationError("v")).toEqual({
      type: "ValidationError",
      message: "v",
    });
    expect(createAIError("a")).toEqual({ type: "AIError", message: "a" });
    expect(createNetworkError("n")).toEqual({
      type: "NetworkError",
      message: "n",
    });
  });

  it("safeOperation wraps exceptions", () => {
    const op = safeOperation((x: number) => {
      if (x < 0) throw new Error("bad");
      return x + 1;
    });
    expect(op(1)).toEqual(E.right(2));
    const err = op(-1);
    expect(err._tag).toBe("Left");
  });

  it("formatError maps types", () => {
    expect(formatError(createFileError("f"))).toContain("File Error");
    expect(formatError(createValidationError("v"))).toContain(
      "Validation Error"
    );
    expect(formatError(createAIError("a"))).toContain("AI Analysis Error");
    expect(formatError(createNetworkError("n"))).toContain("Network Error");
  });

  it("safeFileExists uses fs.existsSync", async () => {
    const existsSync = vi.fn().mockReturnValue(true);
    vi.doMock("fs", () => ({
      default: { existsSync },
      existsSync,
    }));

    const { safeFileExists: sfe } = await import("./error-handling.js");
    const res = await sfe("/tmp/x");
    expect(res).toEqual(E.right(true));
  });

  it("safeReadFile returns Right on success", async () => {
    const readFileSync = vi.fn().mockReturnValue("content");
    vi.doMock("fs", () => ({
      default: { readFileSync },
      readFileSync,
    }));

    const { safeReadFile: srf } = await import("./error-handling.js");
    const res = await srf("/tmp/x");
    expect(res).toEqual(E.right("content"));
  });
});
