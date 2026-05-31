/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages/core/test', '<rootDir>/packages/contracts/test'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'packages/core/src/**/*.ts',
    'packages/contracts/src/**/*.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['json-summary', 'text'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@maks-it.com/webui-contracts$': '<rootDir>/packages/contracts/src/index.ts',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json',
      },
    ],
  },
}
