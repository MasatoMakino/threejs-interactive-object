import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: "webdriverio",
      headless: true,
      isolate: false,
      instances: [
        {
          browser: "chrome",
          capabilities: {
            "goog:chromeOptions": {
              args: ["--use-gl=angle", "--use-angle=swiftshader"],
            },
          },
        },
      ],
    },
    coverage: {
      provider: "istanbul",
      reporter: ["text", "lcov", "json-summary", "json"],
      include: ["src/**/*.ts"],
      reportOnFailure: true,
    },
  },
});
