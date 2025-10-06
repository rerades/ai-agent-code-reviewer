import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as E from "fp-ts/lib/Either.js";
import type { AnalysisInput } from "../types/index.js";

describe("ai-safe", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("safeAnalyzeCode returns Right(text) when underlying AI succeeds", async () => {
    vi.doMock("ai", () => ({ generateText: async () => ({ text: "ok" }) }));
    vi.doMock("@ai-sdk/openai", () => ({ openai: () => ({}) }));

    const { safeAnalyzeCode } = await import("./ai-safe.js");
    const config = { model: "test", maxTokens: 10, focus: "bugs" };
    const input: AnalysisInput = { code: "console.log(1)", filename: "/tmp/x.ts" as any, language: "TypeScript" };

    const res = await safeAnalyzeCode(config, input);
    expect(res).toEqual(E.right("ok"));
  });
});


