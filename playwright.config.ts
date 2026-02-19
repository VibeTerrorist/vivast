import { defineConfig, devices } from '@playwright/test';

// Load environment variables from .env file
require('dotenv').config();

export default defineConfig({
  testDir: './tests/e2e',

  // Timeout configurations
  timeout: 60000,
  expect: {
    timeout: 10000,
  },

  // CI optimizations
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  // Reporter configuration
  reporter: process.env.CI
    ? [
        ['github'],  // GitHub Actions annotations with test steps
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
      ]
    : [
        ['list'],  // Detailed list for local development
        ['html', { outputFolder: 'playwright-report' }],
      ],

  use: {
    baseURL: 'https://www.vivastreet.co.uk',
    testIdAttribute: 'data-automation',

    // Trace and debugging
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Browser context
    viewport: { width: 1920, height: 1080 },
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
