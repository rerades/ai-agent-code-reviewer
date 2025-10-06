import { describe, it, expect } from "vitest";

describe("config", () => {
  it("exports reviewerConfig with known presets", async () => {
    const mod = await import("./config.js");
    expect(Object.keys(mod.reviewerConfig)).toEqual(
      expect.arrayContaining(["quick", "thorough", "security", "performance"])
    );
    expect(mod.reviewerConfig.quick).toEqual({
      model: "gpt-4o-mini",
      maxTokens: 1000,
      focus: "bugs and obvious issues",
    });
  });

  it("getConfig returns the requested preset and defaults to quick", async () => {
    const mod = await import("./config.js");
    expect(mod.getConfig("performance")).toEqual({
      model: "gpt-4o",
      maxTokens: 2000,
      focus: "performance and scalability",
    });
    // default
    expect(mod.getConfig()).toEqual(mod.reviewerConfig.quick);
    // invalid key falls back to quick
    expect((mod.getConfig as any)("does-not-exist")).toEqual(
      mod.reviewerConfig.quick
    );
  });
});
