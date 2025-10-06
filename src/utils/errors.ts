import type {
  FileError,
  ValidationError,
  AIError,
  NetworkError,
  AppError,
} from "../types/index.js";

// Error ADTs constructors
export const createFileError = (message: string): FileError => ({
  type: "FileError",
  message,
});
export const createValidationError = (message: string): ValidationError => ({
  type: "ValidationError",
  message,
});
export const createAIError = (message: string): AIError => ({
  type: "AIError",
  message,
});
export const createNetworkError = (message: string): NetworkError => ({
  type: "NetworkError",
  message,
});

// Formatting and logging kept close to ADTs
export const formatError = (error: AppError): string => {
  switch (error.type) {
    case "FileError":
      return `❌ File Error: ${error.message}`;
    case "ValidationError":
      return `❌ Validation Error: ${error.message}`;
    case "AIError":
      return `❌ AI Analysis Error: ${error.message}`;
    case "NetworkError":
      return `❌ Network Error: ${error.message}`;
    default:
      return `❌ Unknown Error: ${(error as AppError).message}`;
  }
};

export const logError = (error: AppError): AppError => {
  console.error(`Error: ${error.type} - ${error.message}`);
  return error;
};

export const logSuccess = (message: string): string => {
  console.log(`✅ ${message}`);
  return message;
};
