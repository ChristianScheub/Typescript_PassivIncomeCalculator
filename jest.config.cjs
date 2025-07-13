module.exports = {
  testEnvironment: "jsdom",
  preset: "ts-jest",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  testMatch: [
    "**/__tests__/**/*.(ts|tsx|js)",
    "**/*.(test|spec).(ts|tsx|js)"
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/types$": "<rootDir>/src/types/index",
    "^@service/(.*)$": "<rootDir>/src/service/$1",
    "^@ui/(.*)$": "<rootDir>/src/ui/$1",
    "^@view/(.*)$": "<rootDir>/src/view/$1",
    "^@container/(.*)$": "<rootDir>/src/container/$1"
  },
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/service/infrastructure/formatService/**/*.{ts,tsx}",
    "src/service/infrastructure/configService/**/*.{ts,tsx}",
    "src/service/domain/financial/income/incomeCalculatorService/**/*.{ts,tsx}",
    "src/service/domain/financial/expenses/expenseCalculatorService/**/*.{ts,tsx}",
    "src/service/domain/financial/liabilities/liabilityCalculatorService/**/*.{ts,tsx}",
    "!src/service/**/*.d.ts",
    "!src/service/**/__tests__/**",
    "!src/service/**/*.test.{ts,tsx}",
    "!src/service/**/*.spec.{ts,tsx}",
    "!src/service/**/index.ts"
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageReporters: [
    "text",
    "text-summary", 
    "html",
    "lcov",
    "clover",
    "json-summary"
  ],
  coverageDirectory: "coverage",
  testPathIgnorePatterns: [
    "/node_modules/",
    "/coverage/",
    "/dist/"
  ],
  clearMocks: true,
  verbose: true,
  transformIgnorePatterns: [
    "node_modules/(?!(.*\\.mjs$))"
  ]
};