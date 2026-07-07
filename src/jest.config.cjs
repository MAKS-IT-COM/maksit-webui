/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'contracts/**/*.ts',
    'core/**/*.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['json-summary', 'text'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@webui/contracts$': '<rootDir>/contracts/index.ts',
    '^@webui/contracts/(.*)$': '<rootDir>/contracts/$1',
    '^@webui/core$': '<rootDir>/core/index.ts',
    '^@webui/core/(.*)$': '<rootDir>/core/$1',
    '^@webui/components$': '<rootDir>/components/index.ts',
    '^@webui/components/(.*)$': '<rootDir>/components/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
}
