import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createFileError,
  createValidationError,
  createAIError,
  createNetworkError,
  formatError,
  logError,
  logSuccess,
} from "./errors.js";
import type { AppError } from "../types/index.js";

describe("errors utils", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Error constructors", () => {
    it("createFileError creates FileError with correct type and message", () => {
      const error = createFileError("File not found");
      expect(error).toEqual({
        type: "FileError",
        message: "File not found",
      });
    });

    it("createValidationError creates ValidationError with correct type and message", () => {
      const error = createValidationError("Invalid input");
      expect(error).toEqual({
        type: "ValidationError",
        message: "Invalid input",
      });
    });

    it("createAIError creates AIError with correct type and message", () => {
      const error = createAIError("AI service unavailable");
      expect(error).toEqual({
        type: "AIError",
        message: "AI service unavailable",
      });
    });

    it("createNetworkError creates NetworkError with correct type and message", () => {
      const error = createNetworkError("Connection timeout");
      expect(error).toEqual({
        type: "NetworkError",
        message: "Connection timeout",
      });
    });

    it("error constructors handle empty strings", () => {
      expect(createFileError("")).toEqual({
        type: "FileError",
        message: "",
      });
      expect(createValidationError("")).toEqual({
        type: "ValidationError",
        message: "",
      });
    });

    it("error constructors handle special characters", () => {
      const specialMessage = "Error with special chars: \n\t\"'";
      expect(createFileError(specialMessage)).toEqual({
        type: "FileError",
        message: specialMessage,
      });
    });
  });

  describe("formatError", () => {
    it("formats FileError correctly", () => {
      const error = createFileError("File not found");
      const formatted = formatError(error);
      expect(formatted).toBe("❌ File Error: File not found");
    });

    it("formats ValidationError correctly", () => {
      const error = createValidationError("Invalid input");
      const formatted = formatError(error);
      expect(formatted).toBe("❌ Validation Error: Invalid input");
    });

    it("formats AIError correctly", () => {
      const error = createAIError("AI service unavailable");
      const formatted = formatError(error);
      expect(formatted).toBe("❌ AI Analysis Error: AI service unavailable");
    });

    it("formats NetworkError correctly", () => {
      const error = createNetworkError("Connection timeout");
      const formatted = formatError(error);
      expect(formatted).toBe("❌ Network Error: Connection timeout");
    });

    it("handles empty messages", () => {
      const error = createFileError("");
      const formatted = formatError(error);
      expect(formatted).toBe("❌ File Error: ");
    });

    it("handles special characters in messages", () => {
      const specialMessage = "Error with \n\t\"' special chars";
      const error = createFileError(specialMessage);
      const formatted = formatError(error);
      expect(formatted).toBe(`❌ File Error: ${specialMessage}`);
    });

    it("handles unknown error types with default case", () => {
      const unknownError = {
        type: "UnknownError" as any,
        message: "Something went wrong",
      } as AppError;

      const formatted = formatError(unknownError);
      expect(formatted).toBe("❌ Unknown Error: Something went wrong");
    });
  });

  describe("logError", () => {
    it("logs error to console and returns the same error", () => {
      const error = createFileError("Test error");
      const result = logError(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error: FileError - Test error"
      );
      expect(result).toBe(error);
    });

    it("logs different error types correctly", () => {
      const validationError = createValidationError("Invalid data");
      logError(validationError);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error: ValidationError - Invalid data"
      );

      const aiError = createAIError("AI failed");
      logError(aiError);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error: AIError - AI failed"
      );
    });

    it("handles empty error messages", () => {
      const error = createFileError("");
      logError(error);
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error: FileError - ");
    });

    it("handles special characters in error messages", () => {
      const specialMessage = "Error with \n\t\"' chars";
      const error = createFileError(specialMessage);
      logError(error);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Error: FileError - ${specialMessage}`
      );
    });
  });

  describe("logSuccess", () => {
    it("logs success message to console and returns the same message", () => {
      const message = "Operation completed successfully";
      const result = logSuccess(message);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "✅ Operation completed successfully"
      );
      expect(result).toBe(message);
    });

    it("handles empty success messages", () => {
      const result = logSuccess("");
      expect(consoleLogSpy).toHaveBeenCalledWith("✅ ");
      expect(result).toBe("");
    });

    it("handles special characters in success messages", () => {
      const specialMessage = "Success with \n\t\"' chars";
      const result = logSuccess(specialMessage);
      expect(consoleLogSpy).toHaveBeenCalledWith(`✅ ${specialMessage}`);
      expect(result).toBe(specialMessage);
    });

    it("handles different success message formats", () => {
      const messages = [
        "File processed",
        "Analysis complete",
        "Review finished",
        "Task done",
      ];

      messages.forEach((message) => {
        logSuccess(message);
        expect(consoleLogSpy).toHaveBeenCalledWith(`✅ ${message}`);
      });
    });
  });

  describe("Integration tests", () => {
    it("complete error flow: create -> format -> log", () => {
      const error = createFileError("Integration test error");
      const formatted = formatError(error);
      const logged = logError(error);

      expect(formatted).toBe("❌ File Error: Integration test error");
      expect(logged).toBe(error);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error: FileError - Integration test error"
      );
    });

    it("complete success flow: log success message", () => {
      const message = "Integration test success";
      const result = logSuccess(message);

      expect(result).toBe(message);
      expect(consoleLogSpy).toHaveBeenCalledWith("✅ Integration test success");
    });

    it("error type consistency across all functions", () => {
      const errorTypes = [
        {
          create: createFileError,
          type: "FileError",
          formattedContains: "File Error",
        },
        {
          create: createValidationError,
          type: "ValidationError",
          formattedContains: "Validation Error",
        },
        {
          create: createAIError,
          type: "AIError",
          formattedContains: "AI Analysis Error",
        },
        {
          create: createNetworkError,
          type: "NetworkError",
          formattedContains: "Network Error",
        },
      ];

      errorTypes.forEach(({ create, type, formattedContains }) => {
        const error = create("Test message");
        const formatted = formatError(error);
        const logged = logError(error);

        expect(error.type).toBe(type);
        expect(formatted).toContain(formattedContains);
        expect(logged.type).toBe(type);
      });
    });
  });
});
