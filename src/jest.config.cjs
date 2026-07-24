const shared = {
  preset: 'ts-jest',
  roots: ['<rootDir>/test'],
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

/** @type {import('jest').Config} */
module.exports = {
  collectCoverageFrom: [
    'contracts/**/*.ts',
    'core/**/*.{ts,tsx}',
    'components/components/FileBrowser/format.ts',
    'components/components/FileBrowser/prefs.ts',
    'components/components/CookieConsent/cookies.ts',
    'components/components/Loader/loaderEvents.ts',
    'components/components/social/WhatsAppButton.tsx',
    'components/components/social/FacebookMessengerButton.tsx',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['json-summary', 'text'],
  projects: [
    {
      ...shared,
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/test/contracts/**/*.test.ts',
        '<rootDir>/test/core/functions/**/*.test.ts',
        '<rootDir>/test/core/http/**/*.test.ts',
        '<rootDir>/test/core/signalr/**/*.test.ts',
      ],
    },
    {
      ...shared,
      displayName: 'jsdom',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
      testMatch: [
        '<rootDir>/test/core/hooks/**/*.test.ts',
        '<rootDir>/test/components/**/*.test.ts',
      ],
    },
  ],
}
