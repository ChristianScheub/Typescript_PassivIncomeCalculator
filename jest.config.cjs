module.exports = {
  testEnvironment: "jsdom",
  preset: "ts-jest",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  testMatch: [
    "**/__tests__/**/*.(ts|tsx|js)",
    "**/*.(test|spec).(ts|tsx|js)",
    "!**/__tests__/mockServices.ts",
    "!**/__tests__/setup.ts"
  ],
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/service/**/*.ts",
    "!src/service/**/*.d.ts",
    "!src/service/**/__tests__/**",
    "!src/service/**/*.test.{ts,tsx}",
    "!src/service/**/*.spec.{ts,tsx}",
    "!src/service/**/index.ts"
  ],
  coverageThreshold: {
    global: {
      branches: 12,
      functions: 12,
      lines: 12,
      statements: 12
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
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }]
  }
};