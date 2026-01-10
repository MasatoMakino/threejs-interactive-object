import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: "webdriverio",
      headless: true,
      isolate: false,
      instances: [{ browser: "chrome" }],
    },
    coverage: {
      provider: "istanbul",
      reporter: ["text", "lcov", "json-summary", "json"],
      include: ["src/**/*.ts"],
      reportOnFailure: true,
    },
  },
});
