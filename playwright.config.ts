import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  forbidOnly: true,
  failOnFlakyTests: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [["list"], ["html", { open: "never" }], ["junit", { outputFile: "test-results/results.xml" }]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "node scripts/serve-export.mjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 15_000,
  },
})
