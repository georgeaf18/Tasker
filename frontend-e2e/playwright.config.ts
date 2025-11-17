import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * Playwright E2E Test Configuration for Tasker
 *
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),

  // Test timeout: 60 seconds per test (increased for slower CI)
  timeout: 60000,

  // Expect timeout: 10 seconds for assertions (increased for UI to render)
  expect: {
    timeout: 10000,
  },

  // Fail fast in CI, continue locally for better debugging
  fullyParallel: true,

  // Retry failed tests in CI for flakiness, no retries locally
  retries: process.env['CI'] ? 2 : 0,

  // Workers: use all CPUs in CI, limit locally for stability
  workers: process.env['CI'] ? '100%' : 4,

  // Reporter configuration
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    process.env['CI'] ? ['github'] : ['list'],
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on first retry */
    video: 'retain-on-failure',

    /* Action timeout: 10 seconds for individual actions */
    actionTimeout: 10000,

    /* Navigation timeout: 15 seconds for page loads */
    navigationTimeout: 15000,
  },

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'npx nx run backend:serve',
      url: 'http://localhost:3000/api',
      reuseExistingServer: !process.env['CI'],
      cwd: workspaceRoot,
      timeout: 180000, // 3 minutes for backend to start
    },
    {
      command: 'npx nx run frontend:serve',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env['CI'],
      cwd: workspaceRoot,
      timeout: 180000, // 3 minutes for frontend to build and serve
    },
  ],

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment for cross-browser testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Uncomment for mobile browsers support
    /* {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }, */

    // Uncomment for branded browsers
    /* {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    } */
  ],
});
