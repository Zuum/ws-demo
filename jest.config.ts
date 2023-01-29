module.exports = {
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^server(.*)$': '<rootDir>/src/server$1',
    '^logger(.*)$': '<rootDir>/src/logger$1',
    '^store(.*)$': '<rootDir>/src/store$1',
    '^client(.*)$': '<rootDir>/src/client$1',
    '^types(.*)$': '<rootDir>/src/types$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {tsconfig: 'tsconfig.json'}],
  },
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  testEnvironment: 'node',
  verbose: true,
};
