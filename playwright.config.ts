import { defineConfig, devices } from "@playwright/test";

// Targets the live deployed app -- this repo's own local dev server (vinext/
// Miniflare) does not start in this sandbox, and the app is a single static
// HTML/CSS/JS file with no server-side state to fake locally anyway.
const LIVE_URL = "https://bluewallet-pro.cl76380.workers.dev";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  expect: { timeout: 8000 },
  fullyParallel: true,
  retries: 1,
  workers: 3,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["json", { outputFile: "playwright-report/results.json" }],
  ],
  use: {
    baseURL: LIVE_URL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "Desktop-Chromium-1920x1080",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1920, height: 1080 } },
    },
    {
      name: "Tablet-WebKit-768x1024",
      use: {
        browserName: "webkit",
        viewport: { width: 768, height: 1024 },
        hasTouch: true,
        isMobile: false,
        userAgent:
          "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      },
    },
    {
      name: "Mobile-WebKit-390x844",
      use: { ...devices["iPhone 14"] },
    },
  ],
});
