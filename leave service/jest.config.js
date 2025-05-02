export default {
    transform: {},
    extensionsToTreatAsEsm: [".ts"],
    globals: {
      "ts-jest": {
        useESM: true,
      },
    },
    preset: "ts-jest",
    testPathIgnorePatterns: [
        '/node_modules/',
        '/src/__tests__/testSetup.ts'
    ],
    testTimeout: 50000,
  };
  