import type {
  SupportedLanguage,
  ReviewResult,
  ReviewError,
  Predicate,
} from "../types/index.js";

// Language detection as a pure function
const detectLanguage = (extension: string): SupportedLanguage => {
  const languages: Record<string, SupportedLanguage> = {
    ".js": "JavaScript",
    ".ts": "TypeScript",
    ".jsx": "React JSX",
    ".tsx": "React TSX",
    ".py": "Python",
    ".go": "Go",
    ".rs": "Rust",
    ".java": "Java",
  };
  return languages[extension] || "Unknown";
};

// Function for getting file extension
const getFileExtension = async (filename: string): Promise<string> => {
  if (typeof filename !== "string") return "";
  const trimmed = filename.trim();
  if (trimmed.length === 0) return "";
  const path = await import("path");
  return path.extname(trimmed);
};

// Function composition for language detection
export const getLanguageFromFilename = async (
  filename: string
): Promise<SupportedLanguage> => {
  if (typeof filename !== "string" || filename.trim().length === 0) {
    return "Unknown";
  }
  const extension = await getFileExtension(filename);
  if (!extension) return "Unknown";
  return detectLanguage(extension);
};

// Pure function to create timestamp
const createTimestamp = (): string => new Date().toISOString();

// Pure function to create review result
export const createReviewResult = (
  filename: string,
  language: SupportedLanguage,
  analysis: string
): ReviewResult => ({
  filename,
  language,
  analysis,
  timestamp: createTimestamp(),
  success: true,
});

// Pure function to create error result
export const createErrorResult = (
  filename: string,
  error: string | Error
): ReviewError => ({
  filename,
  error: typeof error === "string" ? error : error.message,
  timestamp: createTimestamp(),
  success: false,
});

// Note: analysis prompt, AI calls, and validation live in `utils/error-handling.ts`

// File existence checks live in `utils/error-handling.ts`

// Console logging helpers live in `utils/error-handling.ts`

// Function to format review output
export const formatReviewOutput = (
  result: ReviewResult | ReviewError
): string => {
  if (!result.success) {
    return `❌ Error reviewing ${result.filename}:\n${result.error}`;
  }

  return `✅ Review complete: ${result.filename}
📌 Code Review Results for ${result.filename}
Language: ${result.language}
Reviewed: ${result.timestamp}

${"=".repeat(60)}
${result.analysis}
${"=".repeat(60)}`;
};

// Point-free style functions
const isString = (x: unknown): x is string => typeof x === "string";

// Predicate functions
export const isValidInput: Predicate<string> = (x) =>
  isString(x) && x.length > 0;
