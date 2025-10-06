import { describe, it, expect } from "vitest";
import { createAnalysisPrompt } from "./prompt-analysis.js";

describe("createAnalysisPrompt", () => {
  it("includes focus, filename, language and code in the prompt", () => {
    const code = "console.log('hello')";
    const filename = "/tmp/file.ts";
    const focus = "performance and scalability";
    const language = "TypeScript" as const;

    const prompt = createAnalysisPrompt(code, filename, focus, language);

    expect(prompt).toContain(focus);
    expect(prompt).toContain(filename);
    expect(prompt).toContain(language);
    expect(prompt).toContain(code);
  });

  it("uses a fenced code block with lowercased language tag", () => {
    const code = "print('x')";
    const filename = "/tmp/script.PY";
    const focus = "bugs";
    const language = "Python" as const;

    const prompt = createAnalysisPrompt(code, filename, focus, language);

    expect(prompt).toContain("```python");
    expect(prompt).toContain(code);
    expect(prompt.trim().endsWith("```"));
  });
});
