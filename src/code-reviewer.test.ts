import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("code-reviewer exports", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("createCodeReviewerConfig sets defaults and honors overrides", async () => {
    const mod = await import("./code-reviewer.js");
    const def = mod.createCodeReviewerConfig();
    expect(def).toEqual({
      model: "gpt-4o-mini",
      maxTokens: 1000,
      focus: "bugs and obvious issues",
    });

    const custom = mod.createCodeReviewerConfig({
      model: "test",
      maxTokens: 123,
    });
    expect(custom).toEqual({
      model: "test",
      maxTokens: 123,
      focus: "bugs and obvious issues",
    });
  });

  it("getLanguageFromFilename detects based on extension", async () => {
    const mod = await import("./code-reviewer.js");
    await expect(mod.getLanguageFromFilename("x.ts")).resolves.toBe(
      "TypeScript"
    );
    await expect(mod.getLanguageFromFilename("x.js")).resolves.toBe(
      "JavaScript"
    );
    await expect(mod.getLanguageFromFilename("readme.unknown")).resolves.toBe(
      "Unknown"
    );
  });

  it("reviewFile returns failed review when file does not exist", async () => {
    vi.doMock("fs", () => ({
      default: { existsSync: () => false },
      existsSync: () => false,
      readFileSync: () => "",
    }));

    const mod = await import("./code-reviewer.js");
    const reviewer = mod.createCodeReviewer();
    const res = await reviewer.reviewFile("/nope.js");
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toContain("File not found");
    }
  });

  it("reviewFile returns success when fs and AI are mocked", async () => {
    vi.doMock("fs", () => ({
      default: {
        existsSync: () => true,
        readFileSync: () => "console.log('x')",
      },
      existsSync: () => true,
      readFileSync: () => "console.log('x')",
    }));

    vi.doMock("ai", () => ({
      generateText: async () => ({ text: "analysis" }),
    }));
    vi.doMock("@ai-sdk/openai", () => ({
      openai: () => ({}),
    }));

    const mod = await import("./code-reviewer.js");
    const reviewer = mod.createCodeReviewer({ model: "test", maxTokens: 10 });
    const res = await reviewer.reviewFile("/tmp/file.ts");
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.analysis).toBe("analysis");
      expect(res.language).toBeDefined();
    }
  });

  it("formatReviewResult formats success and error outputs", async () => {
    const mod = await import("./code-reviewer.js");
    const success = {
      filename: "file.ts",
      language: "TypeScript",
      analysis: "ok",
      timestamp: new Date().toISOString(),
      success: true,
    } as const;
    const error = {
      filename: "file.ts",
      error: "bad",
      timestamp: new Date().toISOString(),
      success: false,
    } as const;

    const s = mod.formatReviewResult(success as any);
    const e = mod.formatReviewResult(error as any);
    expect(s).toContain("Review complete");
    expect(e).toContain("Error reviewing");
  });

  it("displayReviewResult logs formatted output and returns input", async () => {
    const mod = await import("./code-reviewer.js");
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const success = {
      filename: "file.ts",
      language: "TypeScript",
      analysis: "ok",
      timestamp: new Date().toISOString(),
      success: true,
    } as const;

    const ret = mod.displayReviewResult(success as any);
    expect(ret).toBe(success);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("validateCommandLineArgs validates missing, invalid and valid inputs", async () => {
    const mod = await import("./code-reviewer.js");
    // missing
    const m = mod.validateCommandLineArgs(["node"]);
    expect(m._tag).toBe("Left");
    // invalid
    const i = mod.validateCommandLineArgs(["node", "script", ""]);
    expect(i._tag).toBe("Left");
    // valid
    const v = mod.validateCommandLineArgs(["node", "script", "/tmp/x.ts"]);
    expect(v._tag).toBe("Right");
    if (v._tag === "Right") expect(v.right).toBe("/tmp/x.ts");
    // valid with -filename flag
    const vf = mod.validateCommandLineArgs([
      "node",
      "script",
      "-filename",
      "/tmp/y.ts",
    ]);
    expect(vf._tag).toBe("Right");
    if (vf._tag === "Right") expect(vf.right).toBe("/tmp/y.ts");
  });

  it("processReview succeeds and returns Right when downstream passes", async () => {
    vi.doMock("fs", () => ({
      default: {
        existsSync: () => true,
        readFileSync: () => "console.log('x')",
      },
      existsSync: () => true,
      readFileSync: () => "console.log('x')",
    }));
    vi.doMock("ai", () => ({ generateText: async () => ({ text: "ok" }) }));
    vi.doMock("@ai-sdk/openai", () => ({ openai: () => ({}) }));
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const mod = await import("./code-reviewer.js");
    const res = await mod.processReview(["node", "script", "/tmp/x.ts"]);
    expect(res._tag).toBe("Right");
    expect(logSpy).toHaveBeenCalled();
  });

  it("processReview honors -preset by injecting its focus into the prompt", async () => {
    vi.doMock("fs", () => ({
      default: {
        existsSync: () => true,
        readFileSync: () => "console.log('x')",
      },
      existsSync: () => true,
      readFileSync: () => "console.log('x')",
    }));

    // ensure known focuses from config
    vi.doMock("./config.js", () => ({
      reviewerConfig: {
        quick: {
          model: "gpt-4o-mini",
          maxTokens: 1000,
          focus: "bugs and obvious issues",
        },
        performance: {
          model: "gpt-4o",
          maxTokens: 2000,
          focus: "performance and scalability",
        },
      },
      getConfig: (type: any) =>
        ((
          {
            quick: {
              model: "gpt-4o-mini",
              maxTokens: 1000,
              focus: "bugs and obvious issues",
            },
            performance: {
              model: "gpt-4o",
              maxTokens: 2000,
              focus: "performance and scalability",
            },
          } as any
        )[type] || {
          model: "gpt-4o-mini",
          maxTokens: 1000,
          focus: "bugs and obvious issues",
        }),
    }));

    const promptSeen: string[] = [];
    vi.doMock("ai", () => ({
      generateText: async (opts: any) => {
        promptSeen.push(opts.prompt);
        expect(typeof opts.prompt).toBe("string");
        expect(opts.prompt).toContain("performance and scalability");
        return { text: "ok" };
      },
    }));
    vi.doMock("@ai-sdk/openai", () => ({ openai: () => ({}) }));

    const mod = await import("./code-reviewer.js");
    const res = await mod.processReview([
      "node",
      "script",
      "-preset",
      "performance",
      "-filename",
      "/tmp/x.ts",
    ]);
    expect(res._tag).toBe("Right");
    expect(promptSeen.length).toBeGreaterThan(0);
  });

  it("processReview defaults to quick when -preset is missing or invalid", async () => {
    vi.doMock("fs", () => ({
      default: {
        existsSync: () => true,
        readFileSync: () => "console.log('x')",
      },
      existsSync: () => true,
      readFileSync: () => "console.log('x')",
    }));

    vi.doMock("./config.js", () => ({
      reviewerConfig: {
        quick: {
          model: "gpt-4o-mini",
          maxTokens: 1000,
          focus: "bugs and obvious issues",
        },
      },
      getConfig: (type: any) => ({
        model: "gpt-4o-mini",
        maxTokens: 1000,
        focus: "bugs and obvious issues",
      }),
    }));

    const prompts: string[] = [];
    vi.doMock("ai", () => ({
      generateText: async (opts: any) => {
        prompts.push(opts.prompt);
        expect(opts.prompt).toContain("bugs and obvious issues");
        return { text: "ok" };
      },
    }));
    vi.doMock("@ai-sdk/openai", () => ({ openai: () => ({}) }));

    const mod = await import("./code-reviewer.js");
    // missing -preset
    const res1 = await mod.processReview([
      "node",
      "script",
      "-filename",
      "/tmp/x.ts",
    ]);
    expect(res1._tag).toBe("Right");
    // invalid -preset
    const res2 = await mod.processReview([
      "node",
      "script",
      "-preset",
      "does-not-exist",
      "-filename",
      "/tmp/y.ts",
    ]);
    expect(res2._tag).toBe("Right");
    expect(prompts.length).toBeGreaterThan(1);
  });

  it("processReview fails and returns Left when file missing", async () => {
    vi.doMock("fs", () => ({
      default: { existsSync: () => false },
      existsSync: () => false,
      readFileSync: () => "",
    }));
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const mod = await import("./code-reviewer.js");
    const res = await mod.processReview(["node", "script", "/nope.js"]);
    expect(res._tag).toBe("Left");
    expect(logSpy).toHaveBeenCalled();
  });

  it("main returns result on success and exits on failure", async () => {
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as any);
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    // success case
    vi.doMock("fs", () => ({
      default: {
        existsSync: () => true,
        readFileSync: () => "console.log('x')",
      },
      existsSync: () => true,
      readFileSync: () => "console.log('x')",
    }));
    vi.doMock("ai", () => ({ generateText: async () => ({ text: "ok" }) }));
    vi.doMock("@ai-sdk/openai", () => ({ openai: () => ({}) }));

    let mod = await import("./code-reviewer.js");
    const originalArgv = process.argv;
    process.argv = ["node", "script", "/tmp/x.ts"];
    const ok = await mod.main();
    expect(ok.success).toBe(true);

    // failure case
    vi.resetModules();
    vi.doMock("fs", () => ({
      default: { existsSync: () => false },
      existsSync: () => false,
      readFileSync: () => "",
    }));
    mod = await import("./code-reviewer.js");
    process.argv = ["node", "script", "/nope.ts"];
    await mod.main().catch(() => {});
    expect(exitSpy).toHaveBeenCalledWith(1);
    process.argv = originalArgv;
    logSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it("CodeReviewer alias points to createCodeReviewer", async () => {
    const mod = await import("./code-reviewer.js");
    expect(typeof mod.CodeReviewer).toBe("function");
    const a = mod.CodeReviewer();
    const b = mod.createCodeReviewer();
    expect(Object.keys(a)).toEqual(Object.keys(b));
    expect(typeof a.reviewFile).toBe("function");
  });
});
