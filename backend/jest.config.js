export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  // Focus coverage on core, pure service modules that have unit tests.
  // Integration-heavy files (server, queue, Replicate/OpenAI wiring, routes, middleware)
  // are excluded from coverage thresholds to avoid noisy, low-signal metrics.
  collectCoverageFrom: [
    'src/services/cache.ts',
    'src/services/promptService.ts',
    'src/services/objectVariations.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'],
}

