import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/tests"],
  moduleFileExtensions: ["ts", "js", "json"],
  setupFiles: ["dotenv/config"],
  globals: {
    "ts-jest": {
      isolatedModules: true
    }
  }
};

export default config;

