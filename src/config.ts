export const reviewerConfig = {
  quick: {
    model: "gpt-4o-mini",
    maxTokens: 1000,
    focus: "bugs and obvious issues",
  },
  thorough: {
    model: "gpt-4o",
    maxTokens: 3000,
    focus: "comprehensive analysis including architecture",
  },
  security: {
    model: "gpt-4o",
    maxTokens: 2000,
    focus: "security vulnerabilities and input validation",
  },
  performance: {
    model: "gpt-4o",
    maxTokens: 2000,
    focus: "performance and scalability",
  },
};

export function getConfig(type: keyof typeof reviewerConfig = "quick") {
  return reviewerConfig[type] || reviewerConfig.quick;
}
