# 🤖 AI Agent Code Reviewer

A functional, fully-typed TypeScript code reviewer that leverages functional programming principles and AI analysis to automatically review code.

## ✨ Features

- 🎯 Functional Programming with fp-ts
- 🔒 Fully typed with TypeScript (strict mode)
- 🤖 AI-powered analysis via OpenAI (ai SDK)
- 🛡️ Robust, composable error handling with Either
- 🧩 Pure, composable functions and modular architecture

## 🚀 Installation

```bash
# Clone the repository
git clone <repository-url>
cd ai-agent-code-reviewer

# Install dependencies
pnpm install

# Environment variables
cp .env.example .env
# Edit .env with your OpenAI API key
```

## 🔧 Configuration

Create a `.env` file with your OpenAI API key:

```env
OPENAI_API_KEY=your_api_key_here
```

## 📋 Available Scripts

```bash
# TypeScript (recommended)
npm run review:functional     # Functional code reviewer
npm run review:examples      # Usage examples
npm run type-check          # Type check only (no JS emit)

# JavaScript (legacy)
npm run review              # Original code reviewer
```

## 🎯 Basic Usage

### Functional Code Reviewer

```bash
# Review a specific file
npm run review:functional test/sample.js

# Or using tsx directly
npx tsx src/code-reviewer-functional.ts your-file.js
```

### Usage Examples

```bash
# Run functional usage examples
npm run review:examples test/sample.js
```

## 🏗️ Project Structure

```
src/
├── types/
│   └── index.ts              # Type definitions
├── utils/
│   ├── error-handling.ts     # Functional error handling utilities
│   └── functional.ts         # Functional helpers
├── examples/
│   └── functional-usage.ts   # Usage examples
└── code-reviewer-functional.ts # Main functional code reviewer
```

## 🧠 Functional Programming Principles

### ✅ Pure Functions

```typescript
// Pure function - always returns the same result
export const createTimestamp = (): string => new Date().toISOString();
```

### ✅ Function Composition

```typescript
// Composition using F.pipe
export const getLanguageFromFilename = F.pipe(getFileExtension, detectLanguage);
```

### ✅ Error Handling with Either

```typescript
// Either for safe error handling
const result = await safeReadFile(filename);
if (result._tag === "Left") {
  return createFailedReview(filename, result.left.message);
}
```

### ✅ Reusable, Typed Functions

```typescript
export const analyzeCodeWithAI = async (
  config: CodeReviewerConfig,
  code: string,
  filename: string,
  language: SupportedLanguage
) => {
  /* ... */
};
```

## 🔍 What It Reviews

1. **🐛 Bugs & Logic Issues**

   - Runtime errors
   - Edge cases
   - Off-by-one errors

2. **⚡ Performance Concerns**

   - Inefficient algorithms
   - Memory leaks
   - Unnecessary operations

3. **🔒 Security Issues**

   - Input validation
   - SQL injection
   - XSS vulnerabilities

4. **📝 Code Quality**

   - Readability
   - Maintainability
   - Best practices

5. **🧪 Testing Gaps**
   - Missing test cases
   - Untestable patterns

## 📊 Sample Output

```
✅ Review complete: test/sample.js
📌 Code Review Results for test/sample.js
Language: JavaScript
Reviewed: 2025-10-05T11:27:44.676Z

============================================================
### 1. Bugs and Logic Issues
- **Issue Type:** Null check
  - **Location:** Line 2
  - **Problem:** No null check for userData.email
  - **Fix:** Add validation before accessing properties
  - **Priority:** High
============================================================
```

## 🛠️ Development

### Type Check

```bash
npm run type-check
```

### Core Types

```typescript
// Main types
interface ReviewResult {
  filename: string;
  language: SupportedLanguage;
  analysis: string;
  timestamp: string;
  success: true;
}

interface ReviewError {
  filename: string;
  error: string;
  timestamp: string;
  success: false;
}
```

## 🎨 Advanced Examples

### Batch Review

```typescript
const results = await batchReview([
  "src/utils.ts",
  "src/types.ts",
  "src/main.ts",
]);
```

### Functional Composition

```typescript
const transformResults = F.pipe(
  results,
  filter(isSuccessfulReview),
  map(getAnalysis),
  join("\n\n")
);
```

### Error Handling

```typescript
const safeReview = async (filename: string) => {
  const result = await reviewer.reviewFile(filename);
  return result.success ? E.right(result) : E.left(result.error);
};
```

## 🔧 TypeScript Configuration

Project is configured with:

- **Strict Mode**: Maximum type safety
- **No Emit**: Type-checking only (no JS output)
- **ES Modules**: Full ESM support
- **Functional Types**: Types tailored for FP

## 📚 Dependencies

### Main

- `fp-ts`: Functional programming in TypeScript
- `ai`: AI SDK
- `@ai-sdk/openai`: OpenAI integration

### Dev

- `typescript`: TypeScript compiler
- `tsx`: TypeScript executor
- `@types/node`: Node.js types

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License. See the `LICENSE` file for details.

## 🙏 Acknowledgements

- [fp-ts](https://github.com/gcanti/fp-ts) - Functional programming in TypeScript
- [OpenAI](https://openai.com/) - AI API for code analysis
- [TypeScript](https://www.typescriptlang.org/) - Static type system

---

**Enjoy building in a functional and type-safe way! 🚀**
