/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: [
    "./config/jest-setup-file.ts"
  ],
  "collectCoverageFrom": [
    "src/entities/*.ts",
    "src/helpers/*.ts",
    "src/services/*.ts"
  ],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
};