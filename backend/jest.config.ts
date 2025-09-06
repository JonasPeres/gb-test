import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/main.ts',
    '<rootDir>/app.module.ts',
    '<rootDir>/sku/sku.module.ts',
  ],
  coverageThreshold: {
    global: { statements: 80, branches: 70, functions: 75, lines: 80 },
    'src/sku/**': { statements: 90, branches: 75, functions: 85, lines: 90 },
  },
};
export default config;
