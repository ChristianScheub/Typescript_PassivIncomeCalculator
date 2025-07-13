{
  "testEnvironment": "jsdom",
  "preset": "ts-jest/presets/default-esm",
  "moduleFileExtensions": ["ts", "tsx", "js", "jsx", "json"],
  "testMatch": [
    "**/__tests__/**/*.(ts|tsx|js)",
    "**/*.(test|spec).(ts|tsx|js)"
  ],
  "moduleNameMapping": {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/types$": "<rootDir>/src/types/index",
    "^@service/(.*)$": "<rootDir>/src/service/$1",
    "^@ui/(.*)$": "<rootDir>/src/ui/$1",
    "^@view/(.*)$": "<rootDir>/src/view/$1",
    "^@container/(.*)$": "<rootDir>/src/container/$1"
  },
  "setupFilesAfterEnv": ["<rootDir>/src/test/setup.ts"],
  "collectCoverage": true,
  "collectCoverageFrom": [
    "src/service/**/*.{ts,tsx}",
    "!src/service/**/*.d.ts",
    "!src/service/**/__tests__/**",
    "!src/service/**/*.test.{ts,tsx}",
    "!src/service/**/*.spec.{ts,tsx}",
    "!src/service/**/index.ts"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 90,
      "functions": 90,
      "lines": 90,
      "statements": 90
    }
  },
  "coverageReporters": [
    "text",
    "text-summary", 
    "html",
    "lcov",
    "clover",
    "json-summary"
  ],
  "coverageDirectory": "coverage",
  "testPathIgnorePatterns": [
    "/node_modules/",
    "/coverage/",
    "/dist/"
  ],
  "clearMocks": true,
  "verbose": true,
  "extensionsToTreatAsEsm": [".ts"],
  "globals": {
    "ts-jest": {
      "useESM": true
    }
  }
}