/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.ts$": ["ts-jest", {}],
  },
  setupFilesAfterEnv: [
    "./src/__jest__/test-setup.ts"
  ],
  collectCoverageFrom: [
    "<rootDir>/src/**/*.ts",
    "!<rootDir>/src/__jest__/**"
  ],
};