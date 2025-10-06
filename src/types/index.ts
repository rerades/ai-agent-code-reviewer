/**
 * Type definitions for the functional code reviewer
 */

// Error types
export interface FileError {
  readonly type: "FileError";
  readonly message: string;
}

export interface ValidationError {
  readonly type: "ValidationError";
  readonly message: string;
}

export interface AIError {
  readonly type: "AIError";
  readonly message: string;
}

export interface NetworkError {
  readonly type: "NetworkError";
  readonly message: string;
}

export type AppError = FileError | ValidationError | AIError | NetworkError;

// Review result types
export interface ReviewResult {
  filename: string;
  language: SupportedLanguage;
  analysis: string;
  timestamp: string;
  success: true;
}

export interface ReviewError {
  filename: string;
  error: string;
  timestamp: string;
  success: false;
}

export type ReviewResponse = ReviewResult | ReviewError;

// Configuration types
export interface CodeReviewerConfig {
  model: string;
  maxTokens: number;
  focus: string;
}

export interface CodeReviewerOptions {
  model?: string;
  maxTokens?: number;
  focus?: string;
}

// File operation types
export interface FileContent {
  filename: string;
  content: string;
}

// Language detection types
export type SupportedLanguage =
  | "JavaScript"
  | "TypeScript"
  | "React JSX"
  | "React TSX"
  | "Python"
  | "Go"
  | "Rust"
  | "Java"
  | "Unknown";

// Domain primitives
export type Filename = string & { readonly __brand: "Filename" };

// Analysis input value object
export interface AnalysisInput {
  code: string;
  filename: Filename;
  language: SupportedLanguage;
}

// Batch review types
export interface BatchReviewResult {
  successful: ReviewResult[];
  failed: ReviewError[];
  total: number;
  successRate: number;
}

// Utility types
export type Predicate<T> = (x: T) => boolean;
