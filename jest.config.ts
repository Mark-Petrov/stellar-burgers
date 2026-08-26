import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@pages(.*)$': '<rootDir>/src/pages$1',
    '^@components(.*)$': '<rootDir>/src/components$1',
    '^@ui(.*)$': '<rootDir>/src/components/ui$1',
    '^@ui-pages(.*)$': '<rootDir>/src/components/ui/pages$1',
    '^@utils-types$': '<rootDir>/src/utils/types',
    '^@api$': '<rootDir>/src/utils/burger-api.ts',
    '^@slices/(.*)$': '<rootDir>/src/services/slices/$1',
    '^@selectors/(.*)$': '<rootDir>/src/services/selectors/$1',
    '\\.(css|scss|svg)$': '<rootDir>/jest.fileMock.js'
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx'
        }
      }
    ]
  },
  collectCoverageFrom: [
    'src/services/slices/**/*.ts',
    '!src/services/slices/**/__tests__/**'
  ],
  coverageDirectory: 'coverage'
};

export default config;
