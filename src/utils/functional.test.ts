import { describe, it, expect } from "vitest";
import {
  getLanguageFromFilename,
  createReviewResult,
  createErrorResult,
  formatReviewOutput,
  isValidInput,
} from "./functional.js";

describe("functional utils", () => {
  // internal implementation details are not exported; only test public API

  it("getLanguageFromFilename composes extension + detection", async () => {
    const lang = await getLanguageFromFilename("/tmp/file.test.ts");
    expect(lang).toBe("TypeScript");
  });

  it("getLanguageFromFilename returns Unknown for invalid inputs", async () => {
    // @ts-expect-error testing invalid type
    expect(await getLanguageFromFilename(undefined)).toBe("Unknown");
    // @ts-expect-error testing invalid type
    expect(await getLanguageFromFilename(123)).toBe("Unknown");
    expect(await getLanguageFromFilename("")).toBe("Unknown");
    expect(await getLanguageFromFilename("   ")).toBe("Unknown");
  });

  // getFileExtension and createTimestamp are internal; not tested directly

  it("createReviewResult builds success response", () => {
    const rr = createReviewResult("a.ts", "TypeScript", "ok");
    expect(rr.success).toBe(true);
    expect(rr.filename).toBe("a.ts");
    expect(rr.language).toBe("TypeScript");
  });

  it("createErrorResult builds error response", () => {
    const er = createErrorResult("a.ts", "boom");
    expect(er.success).toBe(false);
    expect(er.error).toBe("boom");
  });

  it("formatReviewOutput prints success and error blocks", () => {
    const ok = createReviewResult("a.ts", "TypeScript", "analysis");
    const outOk = formatReviewOutput(ok);
    expect(outOk).toContain("✅ Review complete");

    const err = createErrorResult("a.ts", "bad");
    const outErr = formatReviewOutput(err);
    expect(outErr).toContain("❌ Error reviewing");
  });

  it("isValidInput predicate", () => {
    expect(isValidInput("a")).toBe(true);
    expect(isValidInput("")).toBe(false);
  });
  // compose/pipe and monoids were removed from public API
});
