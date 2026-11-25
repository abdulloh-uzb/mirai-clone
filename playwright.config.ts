import { defineConfig, devices } from "@playwright/test";

// Port comes from PORT (default 3000). Never reuse an existing server: other
// worktrees may run their own dev server, and tests must hit this one.
const PORT = Number(process.env.PORT ?? 3000);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: { baseURL, trace: "retain-on-failure", locale: "en-US" },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /.*\.mobile\.spec\.ts/,
    },
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 812 },
      },
      testMatch: /.*\.mobile\.spec\.ts/,
    },
  ],
  webServer: {
    command: `pnpm next dev -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: "ignore",
    stderr: "pipe",
    gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
  },
});
