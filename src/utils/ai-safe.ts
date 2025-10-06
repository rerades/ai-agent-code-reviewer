import * as E from "fp-ts/lib/Either.js";
import type { CodeReviewerConfig } from "../types/index.js";
import type { AIError } from "../types/index.js";
import type { AnalysisInput } from "../types/index.js";
import { createAIError } from "./errors.js";
import { createAnalysisPrompt } from "./prompt-analysis.js";

export const safeAnalyzeCode = async (
  config: CodeReviewerConfig,
  input: AnalysisInput
): Promise<E.Either<AIError, string>> => {
  try {
    const { generateText } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");

    const prompt = createAnalysisPrompt(
      input.code,
      input.filename as unknown as string,
      config.focus,
      input.language
    );

    const { text } = await generateText({
      model: openai(config.model),
      prompt,
      maxTokens: config.maxTokens,
    } as any);

    return E.right(text);
  } catch (error) {
    return E.left(
      createAIError(`AI analysis failed: ${(error as Error).message}`)
    );
  }
};
