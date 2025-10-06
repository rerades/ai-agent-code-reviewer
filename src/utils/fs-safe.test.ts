import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as E from "fp-ts/lib/Either.js";

describe("fs-safe", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("safeFileExists returns Right(true) when fs.existsSync is true", async () => {
    vi.doMock("fs", () => ({
      default: { existsSync: () => true },
      existsSync: () => true,
    }));
    const { safeFileExists } = await import("./fs-safe.js");
    const res = await safeFileExists("/tmp/x");
    expect(res).toEqual(E.right(true));
  });

  it("safeReadFile returns Right(content) on success", async () => {
    vi.doMock("fs", () => ({
      default: { readFileSync: () => "data" },
      readFileSync: () => "data",
    }));
    const { safeReadFile } = await import("./fs-safe.js");
    const res = await safeReadFile("/tmp/x");
    expect(res).toEqual(E.right("data"));
  });
});
