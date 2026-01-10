import { defineConfig } from "vitest/config";

export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
  },
  test: {
    browser: {
      enabled: true,
      provider: "webdriverio",
      headless: true,
      isolate: false,
      instances: [
        {
          browser: "chrome",
        },
      ],
    },
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    coverage: {
      provider: "istanbul",
      reporter: ["text", "lcov", "json-summary", "json"],
      include: ["src/**/*.ts"],
      reportOnFailure: true,
    },
  },
});
