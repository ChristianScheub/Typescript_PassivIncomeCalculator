module.exports = {
  testEnvironment: "jsdom",
  preset: "ts-jest",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  testMatch: [
    "**/__tests__/**/*.(ts|tsx|js)",
    "**/*.(test|spec).(ts|tsx|js)"
  ],
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/service/shared/utilities/*.ts",
    "!src/service/**/*.d.ts",
    "!src/service/**/__tests__/**",
    "!src/service/**/*.test.{ts,tsx}",
    "!src/service/**/*.spec.{ts,tsx}",
    "!src/service/**/index.ts"
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
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