import "dotenv/config";
import * as E from "fp-ts/lib/Either.js";
import {
  safeReadFile,
  safeFileExists,
  validateFilename,
  safeAnalyzeCode,
} from "./utils/error-handling.js";
import {
  isValidInput,
  createReviewResult,
  createErrorResult,
  formatReviewOutput,
  getLanguageFromFilename,
} from "./utils/functional.js";
import type {
  CodeReviewerConfig,
  CodeReviewerOptions,
  ReviewResult,
  ReviewError,
  ReviewResponse,
  SupportedLanguage,
} from "./types/index.js";
import { getConfig, reviewerConfig } from "./config.js";
export { getLanguageFromFilename } from "./utils/functional.js";

export const createCodeReviewerConfig = (
  arg1: string | CodeReviewerOptions = "quick",
  arg2: CodeReviewerOptions = {}
): CodeReviewerConfig => {
  const preset = typeof arg1 === "string" ? arg1 : "quick";
  const options = typeof arg1 === "object" && arg1 !== null ? arg1 : arg2;
  const base = getConfig(preset as any);
  return {
    model: options.model || base.model,
    maxTokens: options.maxTokens ?? base.maxTokens,
    focus: options.focus || base.focus,
  };
};

// Reuse shared implementation from utils/functional.ts

// AI analysis and prompt are centralized in `utils/error-handling.ts`

export const reviewFile = async (
  config: CodeReviewerConfig,
  filename: string
): Promise<ReviewResponse> => {
  // Step 1: Validate filename
  const validationResult = validateFilename(filename);
  if (E.isLeft(validationResult)) {
    return createErrorResult(filename, validationResult.left.message);
  }

  // Step 2: Check if file exists
  const fileExistsResult = await safeFileExists(filename);
  if (E.isLeft(fileExistsResult)) {
    return createErrorResult(filename, fileExistsResult.left.message);
  }
  if (!fileExistsResult.right) {
    return createErrorResult(filename, `File not found: ${filename}`);
  }

  // Step 3: Read file content
  const fileContentResult = await safeReadFile(filename);
  if (E.isLeft(fileContentResult)) {
    return createErrorResult(filename, fileContentResult.left.message);
  }

  // Step 4: Detect language
  const language = await getLanguageFromFilename(filename);

  // Step 5: Analyze code with AI
  const analysisResult = await safeAnalyzeCode(config, {
    code: fileContentResult.right,
    filename: filename as any,
    language,
  });

  if (E.isLeft(analysisResult)) {
    return createErrorResult(filename, analysisResult.left.message);
  }

  // Step 6: Create successful result
  return createReviewResult(filename, language, analysisResult.right);
};

// Factory function to create a code reviewer
export const createCodeReviewer = (options: CodeReviewerOptions = {}) => {
  const config = createCodeReviewerConfig("quick", options);

  return {
    config,
    reviewFile: (filename: string) => reviewFile(config, filename),
    detectLanguage: getLanguageFromFilename,
  };
};

// Pure function to format review output
export const formatReviewResult = (result: ReviewResponse): string => {
  return formatReviewOutput(result as any);
};

// Function to display review results (side effect isolated)
export const displayReviewResult = (result: ReviewResponse): ReviewResponse => {
  const output = formatReviewResult(result);
  console.log(output);
  return result;
};

// Pure function to validate command line arguments
export const validateCommandLineArgs = (
  args: string[]
): E.Either<string, string> => {
  const getFlagValue = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const filenameFromFlag = getFlagValue("-filename");
  const filename = filenameFromFlag || args[2];

  if (!filename) {
    return E.left(
      "Usage: node code-reviewer.js -filename <path> [-preset <name>]\nExamples:\n  node code-reviewer.js -filename src/utils.ts\n  node code-reviewer.js -preset performance -filename src/utils.ts"
    );
  }

  if (!isValidInput(filename)) {
    return E.left("Invalid filename provided");
  }

  return E.right(filename);
};

// Function composition for the main process
export const processReview = async (
  args: string[]
): Promise<E.Either<string, ReviewResponse>> => {
  const getFlagValue = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const presetFromFlag = getFlagValue("-preset");
  const presets = Object.keys(reviewerConfig as Record<string, unknown>);
  const preset = presets.includes(presetFromFlag || "")
    ? (presetFromFlag as string)
    : "quick";

  const validationResult = validateCommandLineArgs(args);
  if (E.isLeft(validationResult)) {
    console.log(validationResult.left);
    return E.left(validationResult.left);
  }

  const filename = validationResult.right;

  // Create config from preset and review file
  const config = createCodeReviewerConfig(preset);
  const result = await reviewFile(config, filename);

  // Display results
  displayReviewResult(result);

  return result.success ? E.right(result) : E.left(result.error);
};

// Main function using functional composition
export const main = async (): Promise<ReviewResponse> => {
  console.log(`🔍 Reviewing ${process.argv[2]}...`);

  const result = await processReview(process.argv);

  if (E.isLeft(result)) {
    process.exit(1);
  }

  return result.right;
};

// Export the main function and utilities
export { createCodeReviewer as CodeReviewer };

// Run main if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error: Error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });
}
